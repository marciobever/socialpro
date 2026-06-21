import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }

  const userId = (session.user as { id?: string }).id ?? session.user.email ?? 'unknown';

  try {
    const body = await request.json();
    const { topic, tone, style, slideCount, slides, caption, coverImageUrl, platform } = body;

    if (!topic || !Array.isArray(slides) || slides.length === 0) {
      return NextResponse.json({ error: 'Dados incompletos.' }, { status: 400 });
    }

    const { data, error } = await getSupabase()
      .from('carousels')
      .insert({
        user_id:         userId,
        topic,
        tone:            tone       ?? 'autoridade',
        style:           style      ?? 'lifestyle',
        slide_count:     slideCount ?? slides.length,
        slides,
        caption:         caption    ?? null,
        cover_image_url: coverImageUrl ?? null,
        platform:        platform   ?? 'instagram',
        status:          'draft',
      })
      .select('id')
      .single();

    if (error) throw error;

    return NextResponse.json({ id: data.id });
  } catch (err) {
    console.error('[carousels] save error:', err);
    return NextResponse.json({ error: 'Erro ao salvar carrossel.' }, { status: 500 });
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }

  const userId = (session.user as { id?: string }).id ?? session.user.email ?? 'unknown';

  try {
    const { data, error } = await getSupabase()
      .from('carousels')
      .select('id, topic, tone, style, slide_count, caption, cover_image_url, status, platform, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return NextResponse.json({ carousels: data });
  } catch (err) {
    console.error('[carousels] list error:', err);
    return NextResponse.json({ error: 'Erro ao buscar histórico.' }, { status: 500 });
  }
}
