import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code  = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const baseUrl = process.env.NEXTAUTH_URL?.replace(/\/$/, "") || "";

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

  const clientId     = process.env.TWITTER_CLIENT_ID?.trim();
  const clientSecret = process.env.TWITTER_CLIENT_SECRET?.trim();
  const redirectUri  = `${baseUrl}/api/twitter/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${baseUrl}/app/account?twitter_error=missing_env_vars_client_${!!clientId}_secret_${!!clientSecret}`);
  }

  // Exchange code + PKCE verifier for token (requires Basic Authorization for X Confidential Clients)
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const tokenRes = await fetch("https://api.x.com/2/oauth2/token", {
    method: "POST",
    headers: { 
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${credentials}`
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    }),
  });
  
  const tokenData = await tokenRes.json();
  if (!tokenRes.ok || !tokenData.access_token) {
    console.error("[twitter/callback] token exchange failed. status:", tokenRes.status, "data:", tokenData, "clientIdExists:", !!clientId, "clientSecretExists:", !!clientSecret, "redirectUri:", redirectUri);
    const errDesc = tokenData.error_description || tokenData.error || "token_exchange";
    return NextResponse.redirect(`${baseUrl}/app/account?twitter_error=${encodeURIComponent(errDesc)}`);
  }

  // Get Twitter user info
  const userRes  = await fetch("https://api.x.com/2/users/me", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  
  const userData = await userRes.json();
  if (!userRes.ok || !userData?.data?.id) {
    console.error("[twitter/callback] user fetch failed. status:", userRes.status, "data:", userData);
    return NextResponse.redirect(`${baseUrl}/app/account?twitter_error=user_fetch_failed`);
  }

  const twitterId       = userData.data.id;
  const twitterUsername = userData.data.username ?? "";

  const expiresAt = tokenData.expires_in
    ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
    : null;

  const { error: dbError } = await getSupabase().from("social_connections").upsert({
    user_id:              userId,
    provider:             "x",
    access_token:         tokenData.access_token,
    refresh_token:        tokenData.refresh_token ?? null,
    token_expires_at:     expiresAt,
    provider_account_id:  twitterId,
    provider_username:    twitterUsername,
    available_accounts:   [{ id: twitterId, username: twitterUsername, provider: "x" }],
  }, { onConflict: "user_id,provider" });

  if (dbError) {
    console.error("[twitter/callback] database save failed:", dbError);
    return NextResponse.redirect(`${baseUrl}/app/account?twitter_error=db_error`);
  }

  const response = NextResponse.redirect(`${baseUrl}/app/account?twitter_connected=1`);
  response.cookies.set("twitter_oauth_nonce", "", { maxAge: 0, path: "/" });
  response.cookies.set("twitter_pkce_verifier", "", { maxAge: 0, path: "/" });
  return response;
}
