"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import type { Gender } from "@prisma/client";

export interface PartnerInfo {
  gender: Gender;
  region: string;
  stato: string;
  age?: number;
  isRegistered: boolean;
  userId?: string;
}

interface UseSocketOptions {
  mode: "video" | "text";
  gender: Gender;
  region: string;
  stato: string;
  age?: number;
  userId?: string;
  isAdmin?: boolean;
  adminGenderFilter?: Gender | null;
  preferRegionMatch?: boolean;
}

export function useSocket(options: UseSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const [status, setStatus] = useState<"idle" | "connecting" | "waiting" | "matched" | "disconnected">("idle");
  const [partner, setPartner] = useState<PartnerInfo | null>(null);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [isInitiator, setIsInitiator] = useState(false);
  const [messages, setMessages] = useState<{ from: "me" | "partner"; text: string; time: number }[]>([]);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [banned, setBanned] = useState<{ reason?: string } | null>(null);

  const emitJoin = useCallback(
    (socket: Socket) => {
      socket.emit("join-queue", {
        gender: options.gender,
        region: options.region,
        stato: options.stato,
        age: options.age,
        userId: options.userId,
        isAdmin: options.isAdmin,
        adminGenderFilter: options.adminGenderFilter,
        preferRegionMatch: options.preferRegionMatch,
        mode: options.mode,
      });
    },
    [options]
  );

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    setStatus("connecting");
    const url = process.env.NEXT_PUBLIC_SOCKET_URL || "";
    const socket = io(url, { path: "/api/socket", transports: ["websocket", "polling"] });
    socketRef.current = socket;

    socket.on("connect", () => emitJoin(socket));
    socket.on("waiting", () => setStatus("waiting"));

    socket.on("matched", (data: { partnerId: string; partner: PartnerInfo; isInitiator: boolean }) => {
      setPartner(data.partner);
      setPartnerId(data.partnerId);
      setIsInitiator(data.isInitiator);
      setStatus("matched");
      setMessages([]);
    });

    socket.on("partner-disconnected", () => {
      setStatus("waiting");
      setPartner(null);
      setPartnerId(null);
      emitJoin(socket);
    });

    socket.on("banned", (data: { reason?: string }) => {
      setBanned(data);
      setStatus("disconnected");
      socket.disconnect();
    });

    socket.on("chat-message", (data: { message: string; timestamp: number }) => {
      setMessages((prev) => [...prev, { from: "partner", text: data.message, time: data.timestamp }]);
      setPartnerTyping(false);
    });

    socket.on("typing", () => setPartnerTyping(true));
    socket.on("disconnect", () => setStatus("disconnected"));
  }, [emitJoin]);

  const skip = useCallback(() => {
    socketRef.current?.emit("skip");
    setPartner(null);
    setPartnerId(null);
    setMessages([]);
    setStatus("waiting");
  }, []);

  const stop = useCallback(() => {
    socketRef.current?.emit("stop");
    socketRef.current?.disconnect();
    socketRef.current = null;
    setStatus("idle");
    setPartner(null);
    setPartnerId(null);
    setMessages([]);
  }, []);

  const sendMessage = useCallback(
    (text: string) => {
      if (!partnerId || !text.trim()) return;
      socketRef.current?.emit("chat-message", { to: partnerId, message: text.trim() });
      setMessages((prev) => [...prev, { from: "me", text: text.trim(), time: Date.now() }]);
    },
    [partnerId]
  );

  const sendTyping = useCallback(() => {
    if (partnerId) socketRef.current?.emit("typing", { to: partnerId });
  }, [partnerId]);

  const sendGenderDetected = useCallback((gender: Gender) => {
    socketRef.current?.emit("gender-detected", { gender });
  }, []);

  useEffect(() => {
    return () => {
      socketRef.current?.emit("stop");
      socketRef.current?.disconnect();
    };
  }, []);

  return {
    socket: socketRef,
    status,
    partner,
    partnerId,
    isInitiator,
    messages,
    partnerTyping,
    banned,
    connect,
    skip,
    stop,
    sendMessage,
    sendTyping,
    sendGenderDetected,
  };
}
