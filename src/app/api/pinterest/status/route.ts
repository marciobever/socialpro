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
    return NextResponse.json({ connected: false, username: null });
  }

  const uid = getUserId(session);

  const { data, error } = await getSupabase()
    .from("social_connections")
    .select("provider_username")
    .eq("user_id", uid)
    .eq("provider", "pinterest")
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ connected: false, username: null });
  }

  return NextResponse.json({
    connected: true,
    username:  data.provider_username ?? null,
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
    .eq("provider", "pinterest");

  return NextResponse.json({ disconnected: true });
}
