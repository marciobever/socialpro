import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code  = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const baseUrl = process.env.NEXTAUTH_URL!;

  if (error) return NextResponse.redirect(`${baseUrl}/app/account?twitter_error=denied`);

  let userId = "";
  try {
    const parsed     = JSON.parse(Buffer.from(state ?? "", "base64url").toString());
    const savedNonce = req.cookies.get("twitter_oauth_nonce")?.value;
    if (!savedNonce || parsed.nonce !== savedNonce) {
      return NextResponse.redirect(`${baseUrl}/app/account?twitter_error=invalid_state`);
    }
    userId = parsed.userId;
  } catch {
    return NextResponse.redirect(`${baseUrl}/app/account?twitter_error=invalid_state`);
  }

  const codeVerifier = req.cookies.get("twitter_pkce_verifier")?.value;
  if (!code || !userId || !codeVerifier) {
    return NextResponse.redirect(`${baseUrl}/app/account?twitter_error=missing_params`);
  }

  const clientId     = process.env.TWITTER_CLIENT_ID!;
  const clientSecret = process.env.TWITTER_CLIENT_SECRET!;
  const redirectUri  = `${baseUrl}/api/twitter/callback`;

  // Exchange code + PKCE verifier for token
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const tokenRes = await fetch("https://api.twitter.com/2/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "Authorization": `Basic ${credentials}` },
    body: new URLSearchParams({ code, grant_type: "authorization_code", redirect_uri: redirectUri, code_verifier: codeVerifier }),
  });
  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    console.error("[twitter/callback] token error:", tokenData);
    const errDesc = tokenData.error_description || tokenData.error || "token_exchange";
    return NextResponse.redirect(`${baseUrl}/app/account?twitter_error=${encodeURIComponent(errDesc)}`);
  }

  // Get Twitter user info
  const userRes  = await fetch("https://api.twitter.com/2/users/me", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const userData = await userRes.json();
  const twitterId       = userData.data?.id       ?? "";
  const twitterUsername = userData.data?.username ?? "";

  const expiresAt = tokenData.expires_in
    ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
    : null;

  await getSupabase().from("social_connections").upsert({
    user_id:              userId,
    provider:             "x",
    access_token:         tokenData.access_token,
    token_expires_at:     expiresAt,
    instagram_account_id: twitterId,
    instagram_username:   twitterUsername,
    available_accounts:   tokenData.refresh_token ? [{ refresh_token: tokenData.refresh_token }] : [],
  }, { onConflict: "user_id,provider" });

  const response = NextResponse.redirect(`${baseUrl}/app/account?twitter_connected=1`);
  response.cookies.delete("twitter_oauth_nonce");
  response.cookies.delete("twitter_pkce_verifier");
  return response;
}
