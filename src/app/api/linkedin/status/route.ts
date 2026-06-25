import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ connected: false });

  const { data } = await getSupabase()
    .from("social_connections")
    .select("facebook_page_name, token_expires_at")
    .eq("user_id", session.user.email)
    .eq("provider", "linkedin")
    .maybeSingle();

  const expired = data?.token_expires_at ? new Date(data.token_expires_at) < new Date() : false;
  return NextResponse.json({ connected: !!data && !expired, name: data?.facebook_page_name ?? null, expired });
}

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  await getSupabase().from("social_connections").delete()
    .eq("user_id", session.user.email).eq("provider", "linkedin");

  return NextResponse.json({ disconnected: true });
}
