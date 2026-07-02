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

  const { text, imageUrl } = await req.json();
  if (!text?.trim() && !imageUrl) return NextResponse.json({ error: "Texto e imagem vazios." }, { status: 400 });

  const { data: conn } = await getSupabase()
    .from("social_connections")
    .select("access_token, provider_account_id")
    .eq("user_id", userId)
    .eq("provider", "facebook")
    .maybeSingle();

  if (!conn?.access_token || !conn.provider_account_id) {
    return NextResponse.json({ error: "Facebook não conectado. Vá em Conta → Contas Conectadas." }, { status: 400 });
  }

  const pageId = conn.provider_account_id;
  const endpoint = imageUrl ? `https://graph.facebook.com/v21.0/${pageId}/photos` : `https://graph.facebook.com/v21.0/${pageId}/feed`;

  const body: Record<string, string> = {
    access_token: conn.access_token,
    message: text || "",
  };

  if (imageUrl) {
    body.url = imageUrl;
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error("[facebook/publish]", err);
    return NextResponse.json({ error: err.error?.message ?? "Erro ao publicar no Facebook." }, { status: 500 });
  }

  const data = await res.json();
  return NextResponse.json({ success: true, postId: data.id });
}
