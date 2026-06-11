"use client";

import { useEffect, useRef, useCallback } from "react";
import type { Socket } from "socket.io-client";

interface UseWebRTCOptions {
  socket: React.RefObject<Socket | null>;
  partnerId: string | null;
  isInitiator: boolean;
  enabled: boolean;
}

export function useWebRTC({ socket, partnerId, isInitiator, enabled }: UseWebRTCOptions) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const cleanup = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    pcRef.current?.close();
    pcRef.current = null;
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
  }, []);

  const start = useCallback(async () => {
    if (!socket.current || !partnerId || !enabled) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      const iceServers: RTCIceServer[] = [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ];
      const turnUrl = process.env.NEXT_PUBLIC_TURN_URL;
      const turnUser = process.env.NEXT_PUBLIC_TURN_USERNAME;
      const turnPass = process.env.NEXT_PUBLIC_TURN_CREDENTIAL;
      if (turnUrl && turnUser && turnPass) {
        iceServers.push({ urls: turnUrl, username: turnUser, credential: turnPass });
      }

      const pc = new RTCPeerConnection({ iceServers });
      pcRef.current = pc;

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      pc.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.current?.emit("webrtc-ice", { to: partnerId, candidate: event.candidate });
        }
      };

      const sock = socket.current;

      const onOffer = async ({ from, offer }: { from: string; offer: RTCSessionDescriptionInit }) => {
        if (from !== partnerId) return;
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        sock.emit("webrtc-answer", { to: partnerId, answer });
      };

      const onAnswer = async ({ from, answer }: { from: string; answer: RTCSessionDescriptionInit }) => {
        if (from !== partnerId) return;
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      };

      const onIce = async ({ from, candidate }: { from: string; candidate: RTCIceCandidateInit }) => {
        if (from !== partnerId) return;
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      };

      sock.on("webrtc-offer", onOffer);
      sock.on("webrtc-answer", onAnswer);
      sock.on("webrtc-ice", onIce);

      if (isInitiator) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        sock.emit("webrtc-offer", { to: partnerId, offer });
      }

      return () => {
        sock.off("webrtc-offer", onOffer);
        sock.off("webrtc-answer", onAnswer);
        sock.off("webrtc-ice", onIce);
      };
    } catch (err) {
      console.error("WebRTC error:", err);
    }
  }, [socket, partnerId, isInitiator, enabled]);

  useEffect(() => {
    if (partnerId && enabled) {
      const unsub = start();
      return () => {
        unsub?.then?.((fn) => fn?.());
        cleanup();
      };
    }
    return cleanup;
  }, [partnerId, enabled, start, cleanup]);

  return { localVideoRef, remoteVideoRef, cleanup };
}
