import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  const appId   = process.env.META_APP_ID;
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  if (!session?.user?.email) {
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

  // Encode userId + nonce no state para verificar no callback
  const nonce  = crypto.randomUUID();
  const state  = Buffer.from(JSON.stringify({ userId: session.user.email, nonce })).toString("base64url");

  const oauthUrl =
    `https://www.facebook.com/v21.0/dialog/oauth` +
    `?client_id=${appId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${encodeURIComponent(scopes)}` +
    `&response_type=code` +
    `&state=${state}`;

  const response = NextResponse.redirect(oauthUrl);
  // Salva nonce em cookie HttpOnly para validar no callback
  response.cookies.set("meta_oauth_nonce", nonce, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge:   600,
    path:     "/",
  });

  return response;
}
