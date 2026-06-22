import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey || secretKey.includes('your_')) {
    return NextResponse.json({ error: 'Stripe não configurado.' }, { status: 400 });
  }

  const stripe = new Stripe(secretKey, { apiVersion: '2023-10-16' as any });
  const userId = (session.user as any).id ?? session.user.email ?? '';
  const origin = request.headers.get('origin') || 'http://localhost:3000';

  const { data: sub } = await getSupabase()
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', userId)
    .single();

  if (!sub?.stripe_customer_id) {
    return NextResponse.json({ error: 'Nenhuma assinatura encontrada.' }, { status: 404 });
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer:   sub.stripe_customer_id,
    return_url: `${origin}/app/account`,
  });

  return NextResponse.json({ url: portalSession.url });
}
