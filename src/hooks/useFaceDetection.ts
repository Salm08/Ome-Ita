"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { Gender } from "@prisma/client";

/**
 * Rilevamento genere tramite face-api.js (solo per admin).
 * I modelli vengono caricati da /models al primo utilizzo.
 */
export function useFaceDetection(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  enabled: boolean,
  onDetected?: (gender: Gender) => void
) {
  const [detectedGender, setDetectedGender] = useState<Gender | null>(null);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const modelsLoaded = useRef(false);

  const loadModels = useCallback(async () => {
    if (modelsLoaded.current) return true;
    setLoading(true);
    try {
      const faceapi = await import("face-api.js");
      const MODEL_URL = "/models";
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL),
      ]);
      modelsLoaded.current = true;
      return true;
    } catch (err) {
      console.warn("Face detection models not available:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const detect = useCallback(async () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;

    try {
      const faceapi = await import("face-api.js");
      const detection = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withAgeAndGender();

      if (detection) {
        const gender: Gender = detection.gender === "male" ? "MALE" : "FEMALE";
        setDetectedGender(gender);
        onDetected?.(gender);
      }
    } catch {
      // silently fail
    }
  }, [videoRef, onDetected]);

  useEffect(() => {
    if (!enabled) return;

    loadModels().then((ok) => {
      if (ok) {
        intervalRef.current = setInterval(detect, 3000);
      }
    });

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [enabled, loadModels, detect]);

  return { detectedGender, loading };
}
