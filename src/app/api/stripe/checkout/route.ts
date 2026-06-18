import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Map of plan IDs to simulated Stripe Price IDs (replace with your real live Stripe Price IDs)
const PLAN_PRICE_IDS: Record<string, { monthly: string; yearly: string }> = {
  pro: {
    monthly: 'price_1OproMonthly123',
    yearly: 'price_1OproYearly123',
  },
  agency: {
    monthly: 'price_1OagencyMonthly123',
    yearly: 'price_1OagencyYearly123',
  },
};

export async function POST(request: Request) {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json(
        { error: 'Chave STRIPE_SECRET_KEY não configurada no ambiente.' },
        { status: 400 }
      );
    }

    // Lazy instantiation of Stripe to prevent build-time crashes
    const stripe = new Stripe(secretKey, {
      // @ts-ignore
      apiVersion: '2023-10-16',
    });

    const { planId, billingCycle } = await request.json();

    if (!planId || planId === 'starter') {
      return NextResponse.json(
        { error: 'Não é possível iniciar checkout para o plano gratuito.' },
        { status: 400 }
      );
    }

    const prices = PLAN_PRICE_IDS[planId];
    if (!prices) {
      return NextResponse.json(
        { error: 'Plano inválido ou inexistente.' },
        { status: 400 }
      );
    }

    const priceId = billingCycle === 'yearly' ? prices.yearly : prices.monthly;

    const requestHeaders = new Headers(request.headers);
    const origin = requestHeaders.get('origin') || 'http://localhost:3000';

    // Create the Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${origin}/app/dashboard?session_id={CHECKOUT_SESSION_ID}&plan=${planId}`,
      cancel_url: `${origin}/pricing`,
      metadata: {
        planId,
        billingCycle,
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: 'Não foi possível gerar a URL de pagamento.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });

  } catch (err: any) {
    return NextResponse.json(
      { error: `Erro no checkout: ${err.message || err}` },
      { status: 500 }
    );
  }
}
