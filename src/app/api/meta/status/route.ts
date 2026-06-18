import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ connected: false, instagramId: null, instagramName: null, pageName: null });
  }

  const { data, error } = await getSupabase()
    .from("social_connections")
    .select("instagram_account_id, instagram_username, facebook_page_name, token_expires_at")
    .eq("user_id", session.user.email)
    .eq("provider", "instagram")
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ connected: false, instagramId: null, instagramName: null, pageName: null });
  }

  const expired = data.token_expires_at
    ? new Date(data.token_expires_at) < new Date()
    : false;

  return NextResponse.json({
    connected:      !expired,
    instagramId:    data.instagram_account_id ?? null,
    instagramName:  data.instagram_username   ?? null,
    pageName:       data.facebook_page_name   ?? null,
    tokenExpiresAt: data.token_expires_at     ?? null,
    expired,
  });
}

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  await getSupabase()
    .from("social_connections")
    .delete()
    .eq("user_id", session.user.email)
    .eq("provider", "instagram");

  return NextResponse.json({ disconnected: true });
}
