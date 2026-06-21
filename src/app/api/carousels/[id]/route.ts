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
