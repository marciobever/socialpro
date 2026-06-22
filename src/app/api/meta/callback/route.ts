import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code  = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const baseUrl     = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const redirectUri = `${baseUrl}/api/meta/callback`;
  const appId       = process.env.INSTAGRAM_APP_ID;
  const appSecret   = process.env.INSTAGRAM_APP_SECRET;

  if (error) {
    return NextResponse.redirect(`${baseUrl}/app/brand?meta_error=denied`);
  }

  // Valida nonce CSRF
  let userId = "";
  try {
    const parsed     = JSON.parse(Buffer.from(state ?? "", "base64url").toString());
    const savedNonce = req.cookies.get("meta_oauth_nonce")?.value;
    if (!savedNonce || parsed.nonce !== savedNonce) {
      return NextResponse.redirect(`${baseUrl}/app/brand?meta_error=invalid_state`);
    }
    userId = parsed.userId;
  } catch {
    return NextResponse.redirect(`${baseUrl}/app/brand?meta_error=invalid_state`);
  }

  if (!code || !appId || !appSecret || !userId) {
    return NextResponse.redirect(`${baseUrl}/app/brand?meta_error=missing_config`);
  }

  try {
    // 1. Troca code por short-lived token (Instagram API)
    const tokenBody = new URLSearchParams({
      client_id:     appId,
      client_secret: appSecret,
      grant_type:    "authorization_code",
      redirect_uri:  redirectUri,
      code,
    });

    const tokenRes  = await fetch("https://api.instagram.com/oauth/access_token", {
      method:  "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body:    tokenBody.toString(),
    });
    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      console.error("[meta/callback] token error:", tokenData);
      return NextResponse.redirect(`${baseUrl}/app/brand?meta_error=token_exchange`);
    }

    const shortToken  = tokenData.access_token;
    const instagramId = String(tokenData.user_id ?? "");

    // 2. Troca por long-lived token (60 dias)
    const longRes  = await fetch(
      `https://graph.instagram.com/access_token` +
      `?grant_type=ig_exchange_token` +
      `&client_secret=${appSecret}` +
      `&access_token=${shortToken}`
    );
    const longData = await longRes.json();
    const accessToken      = longData.access_token ?? shortToken;
    const expiresInSeconds = longData.expires_in   ?? 5183944; // ~60 dias
    const expiresAt        = new Date(Date.now() + expiresInSeconds * 1000).toISOString();

    // 3. Busca username do Instagram
    let instagramUsername = "";
    if (instagramId) {
      const igRes  = await fetch(
        `https://graph.instagram.com/v21.0/${instagramId}` +
        `?fields=username,name&access_token=${accessToken}`
      );
      const igData = await igRes.json();
      instagramUsername = igData.username ?? igData.name ?? "";
    }

    // 4. Salva no Supabase
    const { error: dbError } = await getSupabase()
      .from("social_connections")
      .upsert(
        {
          user_id:              userId,
          provider:             "instagram",
          access_token:         accessToken,
          token_expires_at:     expiresAt,
          instagram_account_id: instagramId,
          instagram_username:   instagramUsername,
          facebook_page_id:     "",
          facebook_page_name:   "",
        },
        { onConflict: "user_id,provider" }
      );

    if (dbError) {
      console.error("[meta/callback] Supabase error:", dbError.message);
      return NextResponse.redirect(`${baseUrl}/app/brand?meta_error=server_error`);
    }

    const response = NextResponse.redirect(`${baseUrl}/app/brand?meta_connected=1`);
    response.cookies.delete("meta_oauth_nonce");
    return response;

  } catch (err) {
    console.error("[meta/callback] Unexpected error:", err);
    return NextResponse.redirect(`${baseUrl}/app/brand?meta_error=server_error`);
  }
}
