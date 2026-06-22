import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session   = await getServerSession(authOptions);
  const appId     = process.env.INSTAGRAM_APP_ID;
  const baseUrl   = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  if (!session?.user?.email) {
    return NextResponse.redirect(`${baseUrl}/login`);
  }

  if (!appId) {
    return NextResponse.json({ error: "INSTAGRAM_APP_ID não configurado." }, { status: 500 });
  }

  const redirectUri = `${baseUrl}/api/meta/callback`;

  // Scopes do novo Instagram API
  const scopes = [
    "instagram_business_basic",
    "instagram_content_publish",
    "instagram_business_manage_comments",
    "instagram_business_manage_messages",
  ].join(",");

  // Nonce CSRF
  const nonce = crypto.randomUUID();
  const state = Buffer.from(JSON.stringify({ userId: session.user.email, nonce })).toString("base64url");

  // Novo endpoint: api.instagram.com
  const oauthUrl =
    `https://api.instagram.com/oauth/authorize` +
    `?client_id=${appId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${encodeURIComponent(scopes)}` +
    `&response_type=code` +
    `&state=${state}`;

  const response = NextResponse.redirect(oauthUrl);
  response.cookies.set("meta_oauth_nonce", nonce, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge:   600,
    path:     "/",
  });

  return response;
}
