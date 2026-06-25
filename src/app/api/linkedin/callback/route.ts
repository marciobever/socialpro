import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code  = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const baseUrl = process.env.NEXTAUTH_URL!;

  if (error) return NextResponse.redirect(`${baseUrl}/app/account?linkedin_error=denied`);

  let userId = "";
  try {
    const parsed     = JSON.parse(Buffer.from(state ?? "", "base64url").toString());
    const savedNonce = req.cookies.get("linkedin_oauth_nonce")?.value;
    if (!savedNonce || parsed.nonce !== savedNonce) {
      return NextResponse.redirect(`${baseUrl}/app/account?linkedin_error=invalid_state`);
    }
    userId = parsed.userId;
  } catch {
    return NextResponse.redirect(`${baseUrl}/app/account?linkedin_error=invalid_state`);
  }

  if (!code || !userId) return NextResponse.redirect(`${baseUrl}/app/account?linkedin_error=missing_params`);

  const clientId     = process.env.LINKEDIN_CLIENT_ID!;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET!;
  const redirectUri  = `${baseUrl}/api/linkedin/callback`;

  // Exchange code for token
  const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: redirectUri, client_id: clientId, client_secret: clientSecret }),
  });
  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    console.error("[linkedin/callback] token error:", tokenData);
    return NextResponse.redirect(`${baseUrl}/app/account?linkedin_error=token_exchange`);
  }

  // Get LinkedIn person URN and display name via OpenID userinfo
  const profileRes = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const profile   = await profileRes.json();
  const personUrn = profile.sub ? `urn:li:person:${profile.sub}` : "";
  const name      = profile.name ?? profile.given_name ?? "LinkedIn User";

  const expiresAt = new Date(Date.now() + (tokenData.expires_in ?? 5184000) * 1000).toISOString();

  await getSupabase().from("social_connections").upsert({
    user_id:           userId,
    provider:          "linkedin",
    access_token:      tokenData.access_token,
    token_expires_at:  expiresAt,
    facebook_page_id:  personUrn,   // person URN — needed as post author
    facebook_page_name: name,
  }, { onConflict: "user_id,provider" });

  const response = NextResponse.redirect(`${baseUrl}/app/account?linkedin_connected=1`);
  response.cookies.delete("linkedin_oauth_nonce");
  return response;
}
