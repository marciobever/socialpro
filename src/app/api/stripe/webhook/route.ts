import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { upsertSubscription } from '@/lib/subscription';

const INTRO_LIMIT  = 5;
const PRO_LIMIT    = 15;
const AGENCY_LIMIT = 60;

function planFromPrice(priceId: string): { plan_id: 'intro' | 'pro' | 'agency'; carousel_limit: number } {
  if (priceId === process.env.STRIPE_INTRO_PRICE_ID)  return { plan_id: 'intro',  carousel_limit: INTRO_LIMIT  };
  if (priceId === process.env.STRIPE_AGENCY_PRICE_ID) return { plan_id: 'agency', carousel_limit: AGENCY_LIMIT };
  return { plan_id: 'pro', carousel_limit: PRO_LIMIT };
}

// Stripe v22 removed current_period_* from top-level Subscription type;
// they are still present in the API response, so we access via `any`.
function periodDates(sub: Stripe.Subscription) {
  const s = sub as any;
  return {
    period_start: new Date((s.current_period_start as number) * 1000).toISOString(),
    period_end:   new Date((s.current_period_end   as number) * 1000).toISOString(),
  };
}

export async function POST(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey || secretKey.includes('your_')) {
    return NextResponse.json({ error: 'Stripe não configurado.' }, { status: 400 });
  }

  const stripe = new Stripe(secretKey, { apiVersion: '2023-10-16' as any });

  const body          = await request.text();
  const sig           = request.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret || webhookSecret.includes('your_')) {
    return NextResponse.json({ error: 'Webhook secret ausente.' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    return NextResponse.json({ error: `Assinatura inválida: ${err.message}` }, { status: 400 });
  }

  try {
    switch (event.type) {

      // ── 1. Checkout concluído — primeira assinatura ───────────────────────
      case 'checkout.session.completed': {
        const session      = event.data.object as Stripe.Checkout.Session;
        const userId       = session.metadata?.user_id;
        const customerId   = session.customer as string;
        const subId        = session.subscription as string;
        if (!userId || !subId) break;

        const sub        = await stripe.subscriptions.retrieve(subId);
        const priceId    = sub.items.data[0].price.id;
        const { plan_id, carousel_limit } = planFromPrice(priceId);
        const { period_start, period_end } = periodDates(sub);

        await upsertSubscription({
          user_id:                userId,
          stripe_customer_id:     customerId,
          stripe_subscription_id: subId,
          stripe_price_id:        priceId,
          status:                 'active',
          plan_id,
          carousel_limit,
          carousels_used:         0,
          period_start,
          period_end,
        });

        // Schedule transition intro → pro after 1 month
        if (plan_id === 'intro' && process.env.STRIPE_PRO_PRICE_ID) {
          const s = sub as any;
          const schedule = await stripe.subscriptionSchedules.create({ from_subscription: subId });
          await stripe.subscriptionSchedules.update(schedule.id, {
            end_behavior: 'release',
            phases: [
              {
                items: [{ price: priceId }],
                start_date: s.current_period_start,
                end_date:   s.current_period_end,
              },
              {
                items: [{ price: process.env.STRIPE_PRO_PRICE_ID }],
              },
            ],
          });
        }
        break;
      }

      // ── 2. Fatura paga — renovação mensal ────────────────────────────────
      case 'invoice.paid': {
        const invoice  = event.data.object as any; // Stripe v22: Invoice.subscription moved
        const subId    = invoice.subscription as string;
        const custId   = invoice.customer as string;
        if (!subId) break;

        const sub      = await stripe.subscriptions.retrieve(subId);
        const priceId  = sub.items.data[0].price.id;
        const customer = await stripe.customers.retrieve(custId) as Stripe.Customer;
        const userId   = customer.metadata?.user_id ?? invoice.metadata?.user_id;
        if (!userId) break;

        const { plan_id, carousel_limit } = planFromPrice(priceId);
        const { period_start, period_end } = periodDates(sub);

        await upsertSubscription({
          user_id:                userId,
          stripe_customer_id:     custId,
          stripe_subscription_id: subId,
          stripe_price_id:        priceId,
          status:                 'active',
          plan_id,
          carousel_limit,
          carousels_used:         0, // reset a cada renovação
          period_start,
          period_end,
        });
        break;
      }

      // ── 3. Assinatura atualizada (upgrade/downgrade/pausa) ────────────────
      case 'customer.subscription.updated': {
        const sub      = event.data.object as Stripe.Subscription;
        const custId   = sub.customer as string;
        const customer = await stripe.customers.retrieve(custId) as Stripe.Customer;
        const subAny   = sub as any;
        const userId   = customer.metadata?.user_id ?? subAny.metadata?.user_id;
        if (!userId) break;

        const priceId = sub.items.data[0].price.id;
        const { plan_id, carousel_limit } = planFromPrice(priceId);
        const { period_start, period_end } = periodDates(sub);

        await upsertSubscription({
          user_id:                userId,
          stripe_customer_id:     custId,
          stripe_subscription_id: sub.id,
          stripe_price_id:        priceId,
          status:                 sub.status as any,
          plan_id,
          carousel_limit,
          period_start,
          period_end,
        });
        break;
      }

      // ── 4. Assinatura cancelada ───────────────────────────────────────────
      case 'customer.subscription.deleted': {
        const sub      = event.data.object as Stripe.Subscription;
        const custId   = sub.customer as string;
        const customer = await stripe.customers.retrieve(custId) as Stripe.Customer;
        const subAny   = sub as any;
        const userId   = customer.metadata?.user_id ?? subAny.metadata?.user_id;
        if (!userId) break;

        await upsertSubscription({
          user_id:                userId,
          stripe_subscription_id: sub.id,
          status:                 'canceled',
          plan_id:                'free',
          carousel_limit:         0,
        });
        break;
      }
    }
  } catch (err: any) {
    console.error('[webhook] handler error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
