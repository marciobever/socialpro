import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";
import { hasActivePlan } from "@/lib/subscription";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const userId = session.user.email;
  if (!(await hasActivePlan(userId))) return NextResponse.json({ error: "subscription_required" }, { status: 402 });

  const { text } = await req.json();
  if (!text?.trim()) return NextResponse.json({ error: "Texto vazio." }, { status: 400 });
  if (text.length > 280) return NextResponse.json({ error: "Tweet excede 280 caracteres." }, { status: 400 });

  const { data: conn } = await getSupabase()
    .from("social_connections")
    .select("access_token, instagram_username")
    .eq("user_id", userId)
    .eq("provider", "x")
    .maybeSingle();

  if (!conn?.access_token) {
    return NextResponse.json({ error: "X/Twitter não conectado. Vá em Conta → Contas Conectadas." }, { status: 400 });
  }

  const res = await fetch("https://api.twitter.com/2/tweets", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${conn.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  const data = await res.json() as { data?: { id?: string }; detail?: string; title?: string };
  if (!res.ok) {
    console.error("[twitter/publish]", data);
    return NextResponse.json({ error: data.detail ?? data.title ?? "Erro ao publicar no X." }, { status: 500 });
  }

  const tweetId = data.data?.id ?? "";
  return NextResponse.json({
    success: true,
    tweetId,
    permalink: `https://x.com/${conn.instagram_username}/status/${tweetId}`,
  });
}
