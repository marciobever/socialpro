import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSubscription } from '@/lib/subscription';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }

  const userId = (session.user as any).id ?? session.user.email ?? '';
  const sub    = await getSubscription(userId);

  return NextResponse.json({ subscription: sub });
}
