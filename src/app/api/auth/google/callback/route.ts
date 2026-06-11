import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { createToken, hashPassword, checkUserBan } from "@/lib/auth";
import { randomBytes } from "crypto";
import { getGoogleRedirectUri, isGoogleOAuthConfigured, OAUTH_STATE_COOKIE } from "@/lib/google-oauth";

interface GoogleUserInfo {
  sub: string;
  email: string;
  email_verified?: boolean;
  name?: string;
}

function authCookieResponse(redirectTo: string, token: string, req: Request) {
  const response = NextResponse.redirect(new URL(redirectTo, req.url));
  response.cookies.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  response.cookies.set(OAUTH_STATE_COOKIE, "", { httpOnly: true, maxAge: 0, path: "/" });
  return response;
}

export async function GET(req: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!isGoogleOAuthConfigured()) {
    return NextResponse.redirect(new URL("/login?error=google-non-configurato", req.url));
  }

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const oauthError = searchParams.get("error");

  if (oauthError) {
    return NextResponse.redirect(new URL("/login?error=google-annullato", req.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=google-annullato", req.url));
  }

  const cookieStore = await cookies();
  const savedState = cookieStore.get(OAUTH_STATE_COOKIE)?.value;
  if (!state || !savedState || state !== savedState) {
    return NextResponse.redirect(new URL("/login?error=google-stato-invalido", req.url));
  }

  try {
    const redirectUri = getGoogleRedirectUri();

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId!,
        client_secret: clientSecret!,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      console.error("Google token error:", tokenData);
      return NextResponse.redirect(new URL("/login?error=google-token", req.url));
    }

    const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userRes.ok) {
      return NextResponse.redirect(new URL("/login?error=google-errore", req.url));
    }

    const googleUser: GoogleUserInfo = await userRes.json();

    if (!googleUser.email) {
      return NextResponse.redirect(new URL("/login?error=google-email-mancante", req.url));
    }

    let user = await prisma.user.findFirst({
      where: { OR: [{ googleId: googleUser.sub }, { email: googleUser.email }] },
    });

    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      const passwordHash = await hashPassword(randomBytes(32).toString("hex"));
      user = await prisma.user.create({
        data: {
          email: googleUser.email,
          passwordHash,
          googleId: googleUser.sub,
          gender: "MALE",
          age: 18,
          region: "Lombardia",
          stato: "online",
          emailVerified: googleUser.email_verified ?? true,
        },
      });
    } else {
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId: googleUser.sub, emailVerified: true },
        });
      }

      const ban = await checkUserBan(user.id);
      if (ban.banned) {
        return NextResponse.redirect(
          new URL(`/login?error=account-sospeso&reason=${encodeURIComponent(ban.reason || "")}`, req.url)
        );
      }
    }

    const token = await createToken({
      id: user.id,
      email: user.email,
      gender: user.gender,
      age: user.age,
      region: user.region,
      stato: user.stato,
      role: user.role,
      emailVerified: user.emailVerified,
      preferRegionMatch: user.preferRegionMatch,
    });

    const redirectTo = isNewUser ? "/profile?complete=1" : "/";
    return authCookieResponse(redirectTo, token, req);
  } catch (err) {
    console.error("Google OAuth error:", err);
    return NextResponse.redirect(new URL("/login?error=google-errore", req.url));
  }
}
