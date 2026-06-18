import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";

interface SlidePayload {
  imageUrl: string; // data:image/png;base64,... or https URL
  title: string;
  subtitle: string;
}

async function uploadImageToStorage(
  userId: string,
  index: number,
  imageUrl: string
): Promise<string> {
  // If already a public https URL, use directly
  if (imageUrl.startsWith("https://")) return imageUrl;

  // Convert base64 data URL to buffer
  const base64 = imageUrl.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64, "base64");

  const path = `${userId}/${Date.now()}-slide-${index}.png`;

  const { error } = await getSupabase().storage
    .from("carousel-images")
    .upload(path, buffer, { contentType: "image/png", upsert: true });

  if (error) throw new Error(`Upload falhou: ${error.message}`);

  const { data } = getSupabase().storage.from("carousel-images").getPublicUrl(path);
  return data.publicUrl;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const userId = session.user.email;

  // Get Meta credentials from Supabase
  const { data: conn } = await getSupabase()
    .from("social_connections")
    .select("access_token, instagram_account_id, token_expires_at")
    .eq("user_id", userId)
    .eq("provider", "instagram")
    .maybeSingle();

  if (!conn?.access_token || !conn?.instagram_account_id) {
    return NextResponse.json(
      { error: "Instagram não conectado. Vá em Brand Kit → Contas Conectadas." },
      { status: 400 }
    );
  }

  if (conn.token_expires_at && new Date(conn.token_expires_at) < new Date()) {
    return NextResponse.json(
      { error: "Token expirado. Reconecte o Instagram em Brand Kit." },
      { status: 400 }
    );
  }

  const body = await req.json();
  const slides: SlidePayload[] = body.slides ?? [];
  const caption: string = body.caption ?? "";

  const slidesWithImages = slides.filter((s) => s.imageUrl);
  if (slidesWithImages.length === 0) {
    return NextResponse.json(
      { error: "Nenhuma imagem gerada. Aguarde a geração de imagens." },
      { status: 400 }
    );
  }

  const { access_token: token, instagram_account_id: igId } = conn;
  const BASE = "https://graph.facebook.com/v21.0";

  try {
    // 1. Upload all images to Supabase Storage and get public URLs
    const publicUrls = await Promise.all(
      slidesWithImages.map((s, i) => uploadImageToStorage(userId, i, s.imageUrl))
    );

    // 2. Create individual media containers on Instagram
    const containerIds: string[] = [];
    for (const url of publicUrls) {
      const res = await fetch(`${BASE}/${igId}/media`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_url: url,
          is_carousel_item: true,
          access_token: token,
        }),
      });
      const data = await res.json();
      if (!data.id) {
        throw new Error(`Falha ao criar container: ${JSON.stringify(data)}`);
      }
      containerIds.push(data.id);
    }

    // 3. Create carousel container
    const carouselRes = await fetch(`${BASE}/${igId}/media`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        media_type: "CAROUSEL",
        children: containerIds.join(","),
        caption,
        access_token: token,
      }),
    });
    const carousel = await carouselRes.json();
    if (!carousel.id) {
      throw new Error(`Falha ao criar carrossel: ${JSON.stringify(carousel)}`);
    }

    // 4. Publish carousel
    const publishRes = await fetch(`${BASE}/${igId}/media_publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ creation_id: carousel.id, access_token: token }),
    });
    const published = await publishRes.json();
    if (!published.id) {
      throw new Error(`Falha ao publicar: ${JSON.stringify(published)}`);
    }

    // 5. Get permalink
    const permalinkRes = await fetch(
      `${BASE}/${published.id}?fields=permalink&access_token=${token}`
    );
    const permalinkData = await permalinkRes.json();

    return NextResponse.json({
      success: true,
      postId: published.id,
      permalink: permalinkData.permalink ?? null,
      slideCount: containerIds.length,
    });
  } catch (err) {
    console.error("[instagram/publish]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao publicar." },
      { status: 500 }
    );
  }
}
