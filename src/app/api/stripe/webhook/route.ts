import { NextResponse } from 'next/server';
import Stripe from 'stripe';

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

    const body = await request.text();
    const sig = request.headers.get('stripe-signature');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !webhookSecret) {
      return NextResponse.json(
        { error: 'Assinatura ou segredo do Webhook Stripe ausente.' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    // Verify webhook signature
    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err: any) {
      return NextResponse.json(
        { error: `Falha na verificação de assinatura: ${err.message}` },
        { status: 400 }
      );
    }

    // Handle the webhook event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerEmail = session.customer_details?.email;
        const planId = session.metadata?.planId;
        
        console.log(`[Stripe Webhook] Compra concluída por: ${customerEmail}. Plano: ${planId}`);
        // TODO: Update user's billing status in your database
        break;
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`[Stripe Webhook] Assinatura atualizada: ${subscription.id} (Status: ${subscription.status})`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`[Stripe Webhook] Assinatura cancelada: ${subscription.id}`);
        break;
      }

      default:
        console.log(`[Stripe Webhook] Evento não tratado: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (err: any) {
    return NextResponse.json(
      { error: `Webhook Handler Error: ${err.message || err}` },
      { status: 500 }
    );
  }
}
