import { NextResponse } from "next/server";
import { createOAuthState, getGoogleRedirectUri, isGoogleOAuthConfigured, OAUTH_STATE_COOKIE } from "@/lib/google-oauth";

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!isGoogleOAuthConfigured()) {
    return NextResponse.json(
      { error: "Google OAuth non configurato. Vedi GOOGLE_SETUP.md" },
      { status: 503 }
    );
  }

  const state = createOAuthState();
  const redirectUri = getGoogleRedirectUri();

  const params = new URLSearchParams({
    client_id: clientId!,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "online",
    prompt: "select_account",
    state,
  });

  const response = NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params}`
  );

  response.cookies.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  return response;
}
