import { randomBytes } from "crypto";

export function getGoogleRedirectUri() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl}/api/auth/google/callback`;
}

export function isGoogleOAuthConfigured() {
  return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function createOAuthState() {
  return randomBytes(24).toString("hex");
}

export const OAUTH_STATE_COOKIE = "google_oauth_state";
