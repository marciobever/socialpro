import { NextResponse } from 'next/server';
import { getServerSession, type Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';

function getUserId(session: Session) {
  return session.user?.email ?? 'unknown';
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  const userId = getUserId(session);

  const { data, error } = await getSupabase()
    .from('scheduled_posts')
    .select('*')
    .eq('user_id', userId)
    .order('scheduled_for', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ posts: data ?? [] });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  const userId = getUserId(session);

  try {
    const { carouselId, caption, scheduledFor } = await request.json();
    if (!carouselId || !scheduledFor) {
      return NextResponse.json({ error: 'carouselId e scheduledFor são obrigatórios.' }, { status: 400 });
    }

    const { data, error } = await getSupabase()
      .from('scheduled_posts')
      .insert({ user_id: userId, carousel_id: carouselId, caption, scheduled_for: scheduledFor, status: 'pending' })
      .select('id')
      .single();

    if (error) throw error;
    return NextResponse.json({ id: data.id });
  } catch (err) {
    console.error('[schedule] error:', err);
    return NextResponse.json({ error: 'Erro ao agendar post.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  const userId = getUserId(session);

  const { id } = await request.json();
  await getSupabase().from('scheduled_posts').delete().eq('id', id).eq('user_id', userId);
  return NextResponse.json({ ok: true });
}
