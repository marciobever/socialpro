import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

// Meta wraps failures as { error: { message, error_user_msg, code, error_subcode, ... } }.
// error_user_msg is already end-user-safe copy when Meta provides one (e.g. copyright takedowns).
function extractMetaError(body: unknown): string {
  const err = (body as { error?: { message?: string; error_user_msg?: string; code?: number } })?.error;
  if (!err) return 'Erro desconhecido ao publicar.';
  if (/copyright|direitos autorais/i.test(err.error_user_msg ?? err.message ?? '')) {
    return 'Publicação recusada pelo Instagram por violação de direitos autorais (copyright) no conteúdo.';
  }
  return err.error_user_msg || err.message || 'Erro desconhecido ao publicar.';
}

// Vercel Cron Job — runs every 5 minutes via vercel.json
// Only accessible with CRON_SECRET header for security
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date().toISOString();

  // Find all pending posts that are due
  const { data: posts, error } = await getSupabase()
    .from('scheduled_posts')
    .select('id, user_id, carousel_id, caption')
    .eq('status', 'pending')
    .lte('scheduled_for', now)
    .limit(10);

  if (error) {
    console.error('[cron/publish-scheduled] fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!posts || posts.length === 0) {
    return NextResponse.json({ processed: 0 });
  }

  const results = await Promise.allSettled(
    posts.map(async (post) => {
      try {
        // Get carousel slides
        const { data: carousel } = await getSupabase()
          .from('carousels')
          .select('slides')
          .eq('id', post.carousel_id)
          .single();

        if (!carousel?.slides?.length) throw new Error('Carrossel sem slides');

        // Get Instagram connection for this user
        const { data: conn } = await getSupabase()
          .from('social_connections')
          .select('access_token, instagram_account_id')
          .eq('user_id', post.user_id)
          .eq('provider', 'instagram')
          .maybeSingle();

        if (!conn?.access_token || !conn?.instagram_account_id) throw new Error('Instagram não conectado');

        const { access_token: token, instagram_account_id: igId } = conn;
        const BASE = 'https://graph.facebook.com/v21.0';
        const slides = carousel.slides.filter((s: { imageUrl?: string }) => s.imageUrl);
        if (!slides.length) throw new Error('Nenhuma imagem disponível');

        // Create media containers
        const containerIds: string[] = [];
        for (const s of slides) {
          let imageUrl = s.imageUrl;
          // Upload base64 to storage if needed
          if (imageUrl.startsWith('data:')) {
            const base64 = imageUrl.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(base64, 'base64');
            const path   = `scheduled/${post.id}/${containerIds.length}.png`;
            const { error: upErr } = await getSupabase().storage.from('carousel-images').upload(path, buffer, { contentType: 'image/png', upsert: true });
            if (upErr) throw new Error('Upload falhou');
            const { data: { publicUrl } } = getSupabase().storage.from('carousel-images').getPublicUrl(path);
            imageUrl = publicUrl;
          }
          const res = await fetch(`${BASE}/${igId}/media`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_url: imageUrl, is_carousel_item: true, access_token: token }),
          });
          const d = await res.json();
          if (!d.id) throw new Error(extractMetaError(d));
          containerIds.push(d.id);
        }

        // Wait for containers
        for (const id of containerIds) {
          for (let i = 0; i < 10; i++) {
            await new Promise(r => setTimeout(r, 3000));
            const r = await fetch(`${BASE}/${id}?fields=status_code&access_token=${token}`);
            const d = await r.json();
            if (d.status_code === 'FINISHED') break;
            if (d.status_code === 'ERROR') throw new Error(`Container ${id} falhou`);
          }
        }

        // Create + publish carousel
        const carRes = await fetch(`${BASE}/${igId}/media`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ media_type: 'CAROUSEL', children: containerIds.join(','), caption: post.caption, access_token: token }),
        });
        const car = await carRes.json();
        if (!car.id) throw new Error(extractMetaError(car));

        const pubRes = await fetch(`${BASE}/${igId}/media_publish`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ creation_id: car.id, access_token: token }),
        });
        const pub = await pubRes.json();
        if (!pub.id) throw new Error(extractMetaError(pub));

        // Update status to published
        await getSupabase().from('scheduled_posts').update({
          status: 'published', published_at: new Date().toISOString(),
        }).eq('id', post.id);

        return { id: post.id, status: 'published' };

      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`[cron] post ${post.id} failed:`, msg);
        await getSupabase().from('scheduled_posts').update({
          status: 'failed', error_message: msg,
        }).eq('id', post.id);
        return { id: post.id, status: 'failed', error: msg };
      }
    })
  );

  const processed = results.filter(r => r.status === 'fulfilled').length;
  return NextResponse.json({ processed, total: posts.length });
}
