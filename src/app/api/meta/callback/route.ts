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

    // 3. Busca TODAS as Páginas + Page Access Tokens (permanentes)
    const pagesRes  = await fetch(
      `https://graph.facebook.com/v21.0/me/accounts?fields=id,name,access_token&access_token=${accessToken}`
    );
    const pagesData = await pagesRes.json();
    const pages: { id: string; name: string; access_token: string }[] = pagesData.data ?? [];

    // 4. Para cada página, busca o Instagram Business Account vinculado
    interface IgAccount {
      instagram_account_id: string;
      instagram_username:   string;
      facebook_page_id:     string;
      facebook_page_name:   string;
      page_token:           string;
    }
    const availableAccounts: IgAccount[] = [];

    for (const page of pages) {
      const igRes  = await fetch(
        `https://graph.facebook.com/v21.0/${page.id}` +
        `?fields=instagram_business_account&access_token=${page.access_token}`
      );
      const igData = await igRes.json();
      const igId   = igData.instagram_business_account?.id ?? "";
      if (!igId) continue;

      const igInfoRes = await fetch(
        `https://graph.facebook.com/v21.0/${igId}` +
        `?fields=username,name&access_token=${page.access_token}`
      );
      const igInfo = await igInfoRes.json();

      availableAccounts.push({
        instagram_account_id: igId,
        instagram_username:   igInfo.username ?? igInfo.name ?? "",
        facebook_page_id:     page.id,
        facebook_page_name:   page.name,
        page_token:           page.access_token,
      });
    }

    // Conta ativa = primeira disponível (usuário pode trocar depois no Brand Kit)
    const active    = availableAccounts[0];
    const pageId    = active?.facebook_page_id    ?? "";
    const pageName  = active?.facebook_page_name  ?? "";
    const finalToken = active?.page_token ?? accessToken;
    const instagramId       = active?.instagram_account_id ?? "";
    const instagramUsername = active?.instagram_username   ?? "";

    // Page Token é permanente; user token expira em 60 dias
    const finalExpires = active?.page_token
      ? new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000).toISOString()
      : expiresAt;

    // 5. Salva no Supabase
    const { error: dbError } = await getSupabase()
      .from("social_connections")
      .upsert(
        {
          user_id:              userId,
          provider:             "instagram",
          access_token:         finalToken,
          available_accounts:   availableAccounts,
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
