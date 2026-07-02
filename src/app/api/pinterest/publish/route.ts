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
  if (!imageUrl) return NextResponse.json({ error: "O Pinterest exige pelo menos uma imagem." }, { status: 400 });

  const { data: conn } = await getSupabase()
    .from("social_connections")
    .select("access_token, provider_account_id") // provider_account_id holds the board_id
    .eq("user_id", userId)
    .eq("provider", "pinterest")
    .maybeSingle();

  if (!conn?.access_token || !conn.provider_account_id) {
    return NextResponse.json({ error: "Pinterest não conectado ou nenhuma pasta encontrada." }, { status: 400 });
  }

  const res = await fetch("https://api.pinterest.com/v5/pins", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${conn.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      board_id: conn.provider_account_id,
      media_source: {
        source_type: "image_url",
        url: imageUrl,
      },
      description: text || "",
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error("[pinterest/publish]", err);
    return NextResponse.json({ error: err.message ?? "Erro ao publicar no Pinterest." }, { status: 500 });
  }

  const data = await res.json();
  return NextResponse.json({ success: true, postId: data.id });
}
