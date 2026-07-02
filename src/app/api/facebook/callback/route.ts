import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { getRequestOrigin } from "@/lib/origin";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code  = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const baseUrl     = getRequestOrigin(req);
  const redirectUri = `${baseUrl}/api/facebook/callback`;
  const appId       = process.env.META_APP_ID ?? process.env.FACEBOOK_CLIENT_ID;
  const appSecret   = process.env.META_APP_SECRET ?? process.env.FACEBOOK_CLIENT_SECRET;

  if (error) {
    return NextResponse.redirect(`${baseUrl}/app/account?meta_error=denied`);
  }

  let userId = "";
  try {
    const parsed     = JSON.parse(Buffer.from(state ?? "", "base64url").toString());
    const savedNonce = req.cookies.get("facebook_oauth_nonce")?.value;
    if (!savedNonce || parsed.nonce !== savedNonce) {
      return NextResponse.redirect(`${baseUrl}/app/account?meta_error=invalid_state`);
    }
    userId = parsed.userId;
  } catch {
    return NextResponse.redirect(`${baseUrl}/app/account?meta_error=invalid_state`);
  }

  if (!code || !appId || !appSecret || !userId) {
    return NextResponse.redirect(`${baseUrl}/app/account?meta_error=missing_config`);
  }

  try {
    const tokenRes = await fetch(
      `https://graph.facebook.com/v21.0/oauth/access_token` +
      `?client_id=${appId}` +
      `&client_secret=${appSecret}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&code=${code}`
    );
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return NextResponse.redirect(`${baseUrl}/app/account?meta_error=token_exchange`);
    }

    const longRes = await fetch(
      `https://graph.facebook.com/v21.0/oauth/access_token` +
      `?grant_type=fb_exchange_token` +
      `&client_id=${appId}` +
      `&client_secret=${appSecret}` +
      `&fb_exchange_token=${tokenData.access_token}`
    );
    const longData         = await longRes.json();
    const accessToken      = longData.access_token ?? tokenData.access_token;

    const pagesRes  = await fetch(
      `https://graph.facebook.com/v21.0/me/accounts?fields=id,name,access_token&access_token=${accessToken}`
    );
    const pagesData = await pagesRes.json();
    const pages: { id: string; name: string; access_token: string }[] = pagesData.data ?? [];

    if (pages.length === 0) {
       return NextResponse.redirect(`${baseUrl}/app/account?meta_error=no_pages`);
    }

    // Default to the first page for simplicity, or save all and let user switch
    const defaultPage = pages[0];

    const { error: dbError } = await getSupabase().from("social_connections").upsert({
      user_id:             userId,
      provider:            "facebook",
      access_token:        defaultPage.access_token, // Save the Page Access Token
      provider_account_id: defaultPage.id,
      provider_username:   defaultPage.name,
      available_accounts:  pages.map(p => ({
        facebook_page_id: p.id,
        facebook_page_name: p.name,
        page_token: p.access_token
      })),
    }, { onConflict: "user_id,provider" });

    if (dbError) {
      console.error("[facebook/callback] db error:", dbError);
      return NextResponse.redirect(`${baseUrl}/app/account?meta_error=server_error`);
    }

    const response = NextResponse.redirect(`${baseUrl}/app/account?meta_connected=1`);
    response.cookies.set("facebook_oauth_nonce", "", { maxAge: 0, path: "/" });
    return response;
  } catch (error) {
    console.error("[facebook/callback] catch error:", error);
    return NextResponse.redirect(`${baseUrl}/app/account?meta_error=server_error`);
  }
}
