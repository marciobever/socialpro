import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getRequestOrigin } from "@/lib/origin";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const clientId = process.env.PINTEREST_CLIENT_ID;
  const baseUrl  = getRequestOrigin(req);

  const userId = session?.user?.email;
  if (!userId) return NextResponse.redirect(`${baseUrl}/login`);

  if (!clientId) {
    return NextResponse.json({ error: "PINTEREST_CLIENT_ID não configurado." }, { status: 500 });
  }

  const redirectUri = `${baseUrl}/api/pinterest/callback`;
  const scopes = [
    "boards:read",
    "boards:write",
    "pins:read",
    "pins:write",
    "user_accounts:read",
  ].join(",");

  const nonce = crypto.randomUUID();
  const state = Buffer.from(JSON.stringify({ userId, nonce })).toString("base64url");

  const oauthUrl =
    `https://www.pinterest.com/oauth/` +
    `?client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent(scopes)}` +
    `&state=${state}`;

  const response = NextResponse.redirect(oauthUrl);
  response.cookies.set("pinterest_oauth_nonce", nonce, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge:   600,
    path:     "/",
  });

  return response;
}
