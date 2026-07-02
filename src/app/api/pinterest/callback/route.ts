import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { getRequestOrigin } from "@/lib/origin";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code  = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const baseUrl     = getRequestOrigin(req);
  const redirectUri = `${baseUrl}/api/pinterest/callback`;
  const clientId    = process.env.PINTEREST_CLIENT_ID;
  const clientSecret= process.env.PINTEREST_CLIENT_SECRET;

  if (error) return NextResponse.redirect(`${baseUrl}/app/account?pinterest_error=denied`);

  let userId = "";
  try {
    const parsed     = JSON.parse(Buffer.from(state ?? "", "base64url").toString());
    const savedNonce = req.cookies.get("pinterest_oauth_nonce")?.value;
    if (!savedNonce || parsed.nonce !== savedNonce) {
      return NextResponse.redirect(`${baseUrl}/app/account?pinterest_error=invalid_state`);
    }
    userId = parsed.userId;
  } catch {
    return NextResponse.redirect(`${baseUrl}/app/account?pinterest_error=invalid_state`);
  }

  if (!code || !clientId || !clientSecret || !userId) {
    return NextResponse.redirect(`${baseUrl}/app/account?pinterest_error=missing_config`);
  }

  try {
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const tokenRes = await fetch(`https://api.pinterest.com/v5/oauth/token`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return NextResponse.redirect(`${baseUrl}/app/account?pinterest_error=token_exchange`);
    }

    const userRes = await fetch("https://api.pinterest.com/v5/user_account", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userData = await userRes.json();
    if (!userRes.ok) {
      return NextResponse.redirect(`${baseUrl}/app/account?pinterest_error=user_fetch_failed`);
    }

    // Fetch boards
    const boardsRes = await fetch("https://api.pinterest.com/v5/boards", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const boardsData = await boardsRes.json();
    let boardId = "";

    if (boardsData.items && boardsData.items.length > 0) {
      boardId = boardsData.items[0].id;
    } else {
      // Create a default board if they have none
      const createBoardRes = await fetch("https://api.pinterest.com/v5/boards", {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${tokenData.access_token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: "SocialPro Posts", description: "Saved via SocialPro" })
      });
      const createData = await createBoardRes.json();
      if (createData.id) boardId = createData.id;
    }

    const { error: dbError } = await getSupabase().from("social_connections").upsert({
      user_id:             userId,
      provider:            "pinterest",
      access_token:        tokenData.access_token,
      refresh_token:       tokenData.refresh_token ?? null,
      provider_account_id: boardId, // Store the board ID as the account ID for posting
      provider_username:   userData.username,
    }, { onConflict: "user_id,provider" });

    if (dbError) {
      console.error("[pinterest/callback] db error:", dbError);
      return NextResponse.redirect(`${baseUrl}/app/account?pinterest_error=server_error`);
    }

    const response = NextResponse.redirect(`${baseUrl}/app/account?pinterest_connected=1`);
    response.cookies.set("pinterest_oauth_nonce", "", { maxAge: 0, path: "/" });
    return response;
  } catch (error) {
    console.error("[pinterest/callback] catch error:", error);
    return NextResponse.redirect(`${baseUrl}/app/account?pinterest_error=server_error`);
  }
}
