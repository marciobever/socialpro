import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey || secretKey.includes('your_')) {
    return NextResponse.json({ error: 'Stripe não configurado.' }, { status: 400 });
  }

  const introPriceId   = process.env.STRIPE_INTRO_PRICE_ID;
  const proPriceId     = process.env.STRIPE_PRO_PRICE_ID;
  const agencyPriceId  = process.env.STRIPE_AGENCY_PRICE_ID;
  if (!introPriceId || !proPriceId) {
    return NextResponse.json({ error: 'Price IDs do Stripe não configurados.' }, { status: 400 });
  }

  const stripe = new Stripe(secretKey, { apiVersion: '2023-10-16' as any });

  const userId = (session.user as any).id ?? session.user.email ?? '';
  const email  = session.user.email ?? '';
  const origin = request.headers.get('origin') || 'http://localhost:3000';

  // Read plan from request body; default to 'pro'
  let requestedPlan = 'pro';
  try { const body = await request.json(); requestedPlan = body?.plan ?? 'pro'; } catch { /* no body */ }

  const priceId = requestedPlan === 'agency' && agencyPriceId
    ? agencyPriceId
    : requestedPlan === 'intro'
      ? introPriceId
      : proPriceId;

  // Get or create Stripe customer
  const { data: sub } = await getSupabase()
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', userId)
    .single();

  let customerId = sub?.stripe_customer_id ?? null;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email,
      metadata: { user_id: userId },
    });
    customerId = customer.id;
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: `${origin}/app/dashboard?subscribed=1`,
    cancel_url:  `${origin}/pricing`,
    metadata:    { user_id: userId },
    subscription_data: {
      metadata: { user_id: userId, pro_price_id: proPriceId },
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
