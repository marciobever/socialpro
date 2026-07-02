import { NextResponse } from "next/server";
import { getServerSession, type Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";

function getUserId(session: Session) {
  return session.user?.email ?? "";
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ connected: false, pageName: null });
  }

  const uid = getUserId(session);

  const { data, error } = await getSupabase()
    .from("social_connections")
    .select("facebook_page_id, facebook_page_name, token_expires_at, available_accounts")
    .eq("user_id", uid)
    .eq("provider", "facebook")
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ connected: false, pageName: null });
  }

  return NextResponse.json({
    connected:          true,
    pageName:           data.facebook_page_name ?? null,
    availableAccounts:  data.available_accounts ?? [],
  });
}

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const uid = getUserId(session);

  await getSupabase()
    .from("social_connections")
    .delete()
    .eq("user_id", uid)
    .eq("provider", "facebook");

  return NextResponse.json({ disconnected: true });
}
