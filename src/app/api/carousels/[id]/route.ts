import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }

  const userId = (session.user as { id?: string }).id ?? session.user.email ?? 'unknown';
  const { id } = await params;

  try {
    const { data, error } = await getSupabase()
      .from('carousels')
      .select('id, topic, tone, style, slide_count, slides, caption, cover_image_url, status, platform, created_at')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) return NextResponse.json({ error: 'Carrossel não encontrado.' }, { status: 404 });

    return NextResponse.json({ carousel: data });
  } catch (err) {
    console.error('[carousels/get] error:', err);
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }

  const userId = (session.user as { id?: string }).id ?? session.user.email ?? 'unknown';
  const email = session.user.email ?? 'unknown';
  const { id } = await params;

  try {
    // Delete any scheduled posts for this carousel to prevent foreign key errors
    await getSupabase()
      .from('scheduled_posts')
      .delete()
      .eq('carousel_id', id)
      .eq('user_id', email);

    // Delete the carousel itself
    const { error } = await getSupabase()
      .from('carousels')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('[carousels/delete] error:', error.message);
      return NextResponse.json({ error: 'Erro ao deletar carrossel.' }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[carousels/delete] error:', err);
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}
