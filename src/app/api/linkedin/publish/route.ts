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

  const { data: conn } = await getSupabase()
    .from("social_connections")
    .select("access_token, facebook_page_id, token_expires_at")
    .eq("user_id", userId)
    .eq("provider", "linkedin")
    .maybeSingle();

  if (!conn?.access_token) {
    return NextResponse.json({ error: "LinkedIn não conectado. Vá em Conta → Contas Conectadas." }, { status: 400 });
  }
  if (conn.token_expires_at && new Date(conn.token_expires_at) < new Date()) {
    return NextResponse.json({ error: "Token LinkedIn expirado. Reconecte em Conta." }, { status: 400 });
  }

  const res = await fetch("https://api.linkedin.com/v2/ugcPosts", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${conn.access_token}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify({
      author: conn.facebook_page_id,  // urn:li:person:{id}
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: { text },
          shareMediaCategory: "NONE",
        },
      },
      visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error("[linkedin/publish]", err);
    return NextResponse.json({ error: (err as { message?: string }).message ?? "Erro ao publicar no LinkedIn." }, { status: 500 });
  }

  const data = await res.json();
  const postId = (data as { id?: string }).id ?? "";
  return NextResponse.json({ success: true, postId });
}
