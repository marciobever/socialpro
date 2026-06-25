import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createHash, randomBytes } from "crypto";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.email;
  const baseUrl = process.env.NEXTAUTH_URL!;
  if (!userId) return NextResponse.redirect(`${baseUrl}/login`);

  const clientId = process.env.TWITTER_CLIENT_ID;
  if (!clientId) return NextResponse.json({ error: "TWITTER_CLIENT_ID não configurado." }, { status: 500 });

  // PKCE
  const codeVerifier = randomBytes(32).toString("base64url");
  const codeChallenge = createHash("sha256").update(codeVerifier).digest("base64url");

  const nonce = crypto.randomUUID();
  const state = Buffer.from(JSON.stringify({ userId, nonce })).toString("base64url");

  const url = new URL("https://twitter.com/i/oauth2/authorize");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", `${baseUrl}/api/twitter/callback`);
  url.searchParams.set("scope", "tweet.write users.read offline.access");
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge", codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");

  const response = NextResponse.redirect(url.toString());
  response.cookies.set("twitter_oauth_nonce", nonce, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 600, path: "/" });
  response.cookies.set("twitter_pkce_verifier", codeVerifier, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 600, path: "/" });
  return response;
}
