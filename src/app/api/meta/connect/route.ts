import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getRequestOrigin } from "@/lib/origin";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const appId   = process.env.META_APP_ID ?? process.env.FACEBOOK_CLIENT_ID;
  const baseUrl = getRequestOrigin(req);

  // Use email consistently for social_connections (same as callback)
  const userId = session?.user?.email;
  if (!userId) {
    return NextResponse.redirect(`${baseUrl}/login`);
  }

  if (!appId) {
    return NextResponse.json({ error: "META_APP_ID não configurado." }, { status: 500 });
  }

  const redirectUri = `${baseUrl}/api/meta/callback`;
  const scopes = [
    "instagram_basic",
    "instagram_content_publish",
    "pages_read_engagement",
    "pages_show_list",
    "business_management",
  ].join(",");

  const nonce = crypto.randomUUID();
  const state = Buffer.from(JSON.stringify({ userId, nonce })).toString("base64url");

  // Facebook OAuth — funciona com Instagram Business vinculado a Página do Facebook
  const oauthUrl =
    `https://www.facebook.com/v21.0/dialog/oauth` +
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
