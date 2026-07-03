import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';

// Returns scheduled posts that failed and haven't been shown to the user yet,
// then immediately marks them as notified so the toast fires only once.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  const userId = session.user.email ?? 'unknown';

  const { data: posts, error } = await getSupabase()
    .from('scheduled_posts')
    .select('id, error_message, scheduled_for')
    .eq('user_id', userId)
    .eq('status', 'failed')
    .is('notified_at', null)
    .order('scheduled_for', { ascending: false })
    .limit(5);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!posts || posts.length === 0) return NextResponse.json({ posts: [] });

  await getSupabase()
    .from('scheduled_posts')
    .update({ notified_at: new Date().toISOString() })
    .in('id', posts.map(p => p.id));

  return NextResponse.json({ posts });
}
