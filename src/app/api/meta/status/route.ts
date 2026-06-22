import { NextResponse } from "next/server";
import { getServerSession, type Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";

// Use email consistently — social_connections.user_id is always stored as email
function getUserId(session: Session) {
  return session.user?.email ?? "";
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ connected: false, instagramId: null, instagramName: null, pageName: null });
  }

  const uid = getUserId(session);

  const { data, error } = await getSupabase()
    .from("social_connections")
    .select("instagram_account_id, instagram_username, facebook_page_name, token_expires_at, available_accounts")
    .eq("user_id", uid)
    .eq("provider", "instagram")
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ connected: false, instagramId: null, instagramName: null, pageName: null });
  }

  const expired = data.token_expires_at
    ? new Date(data.token_expires_at) < new Date()
    : false;

  return NextResponse.json({
    connected:          !expired,
    instagramId:        data.instagram_account_id ?? null,
    instagramName:      data.instagram_username   ?? null,
    pageName:           data.facebook_page_name   ?? null,
    tokenExpiresAt:     data.token_expires_at     ?? null,
    expired,
    availableAccounts:  data.available_accounts   ?? [],
  });
}

// Troca a conta Instagram ativa
export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const uid = getUserId(session);
  const { instagramAccountId } = await request.json();

  const { data } = await getSupabase()
    .from("social_connections")
    .select("available_accounts")
    .eq("user_id", uid)
    .eq("provider", "instagram")
    .single();

  const accounts: {
    instagram_account_id: string;
    instagram_username:   string;
    facebook_page_id:     string;
    facebook_page_name:   string;
    page_token:           string;
  }[] = data?.available_accounts ?? [];

  const selected = accounts.find(a => a.instagram_account_id === instagramAccountId);
  if (!selected) return NextResponse.json({ error: "Conta não encontrada." }, { status: 404 });

  const { error } = await getSupabase()
    .from("social_connections")
    .update({
      instagram_account_id: selected.instagram_account_id,
      instagram_username:   selected.instagram_username,
      facebook_page_id:     selected.facebook_page_id,
      facebook_page_name:   selected.facebook_page_name,
      access_token:         selected.page_token,
    })
    .eq("user_id", uid)
    .eq("provider", "instagram");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, username: selected.instagram_username });
}

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const uid = getUserId(session);

  await getSupabase()
    .from("social_connections")
    .delete()
    .eq("user_id", uid)
    .eq("provider", "instagram");

  return NextResponse.json({ disconnected: true });
}
