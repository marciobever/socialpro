import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code  = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const baseUrl     = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const redirectUri = `${baseUrl}/api/meta/callback`;
  const appId       = process.env.META_APP_ID ?? process.env.FACEBOOK_CLIENT_ID;
  const appSecret   = process.env.META_APP_SECRET ?? process.env.FACEBOOK_CLIENT_SECRET;

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
    // 1. Troca code por short-lived token
    const tokenRes = await fetch(
      `https://graph.facebook.com/v21.0/oauth/access_token` +
      `?client_id=${appId}` +
      `&client_secret=${appSecret}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&code=${code}`
    );
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      console.error("[meta/callback] token error:", tokenData);
      return NextResponse.redirect(`${baseUrl}/app/brand?meta_error=token_exchange`);
    }

    // 2. Troca por long-lived token (~60 dias)
    const longRes = await fetch(
      `https://graph.facebook.com/v21.0/oauth/access_token` +
      `?grant_type=fb_exchange_token` +
      `&client_id=${appId}` +
      `&client_secret=${appSecret}` +
      `&fb_exchange_token=${tokenData.access_token}`
    );
    const longData         = await longRes.json();
    const accessToken      = longData.access_token ?? tokenData.access_token;
    const expiresInSeconds = longData.expires_in   ?? 5183944;
    const expiresAt        = new Date(Date.now() + expiresInSeconds * 1000).toISOString();

    // 3. Busca Páginas + Page Access Token (nunca expira)
    const pagesRes  = await fetch(
      `https://graph.facebook.com/v21.0/me/accounts?fields=id,name,access_token&access_token=${accessToken}`
    );
    const pagesData = await pagesRes.json();
    const page      = pagesData.data?.[0];
    const pageId    = page?.id           ?? "";
    const pageName  = page?.name         ?? "";
    // Page Access Token é permanente (não expira enquanto o usuário não revogar)
    const pageToken = page?.access_token ?? accessToken;

    // 4. Busca Instagram Business Account vinculado à Página
    let instagramId       = "";
    let instagramUsername = "";
    if (pageId) {
      const igRes  = await fetch(
        `https://graph.facebook.com/v21.0/${pageId}` +
        `?fields=instagram_business_account&access_token=${pageToken}`
      );
      const igData = await igRes.json();
      instagramId  = igData.instagram_business_account?.id ?? "";

      if (instagramId) {
        const igInfoRes = await fetch(
          `https://graph.facebook.com/v21.0/${instagramId}` +
          `?fields=username,name&access_token=${pageToken}`
        );
        const igInfo      = await igInfoRes.json();
        instagramUsername = igInfo.username ?? igInfo.name ?? "";
      }
    }

    // Token final: Page Token (permanente) se disponível, senão long-lived user token (60d)
    const finalToken   = pageToken !== accessToken ? pageToken : accessToken;
    const finalExpires = pageToken !== accessToken
      ? new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000).toISOString() // 10 anos (permanente)
      : expiresAt;

    // 5. Salva no Supabase
    const { error: dbError } = await getSupabase()
      .from("social_connections")
      .upsert(
        {
          user_id:              userId,
          provider:             "instagram",
          access_token:         finalToken,
          token_expires_at:     finalExpires,
          facebook_page_id:     pageId,
          facebook_page_name:   pageName,
          instagram_account_id: instagramId,
          instagram_username:   instagramUsername,
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
