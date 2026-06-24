import { getSupabase } from './supabase';

export interface Subscription {
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  status: 'free' | 'active' | 'trialing' | 'past_due' | 'canceled';
  plan_id: 'free' | 'intro' | 'pro' | 'agency';
  carousel_limit: number;
  carousels_used: number;
  period_start: string | null;
  period_end: string | null;
}

const FREE_SUB: Subscription = {
  user_id: '',
  stripe_customer_id: null,
  stripe_subscription_id: null,
  stripe_price_id: null,
  status: 'free',
  plan_id: 'free',
  carousel_limit: 0,
  carousels_used: 0,
  period_start: null,
  period_end: null,
};

// The Meta/Facebook review account always has full access (no Stripe needed).
const TEST_USER_SUB: Omit<Subscription, 'user_id'> = {
  stripe_customer_id: null,
  stripe_subscription_id: null,
  stripe_price_id: null,
  status: 'active',
  plan_id: 'pro',
  carousel_limit: 9999,
  carousels_used: 0,
  period_start: null,
  period_end: null,
};

export async function getSubscription(userId: string): Promise<Subscription> {
  const testEmail = (process.env.TEST_USER_EMAIL ?? '').trim().toLowerCase();
  if (testEmail && userId.trim().toLowerCase() === testEmail) {
    return { ...TEST_USER_SUB, user_id: userId };
  }

  const { data } = await getSupabase()
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();
  return (data as Subscription) ?? { ...FREE_SUB, user_id: userId };
}

export async function canGenerate(userId: string): Promise<{
  allowed: boolean;
  used: number;
  limit: number;
  reason?: string;
}> {
  const sub = await getSubscription(userId);

  if (sub.status !== 'active' && sub.status !== 'trialing') {
    return { allowed: false, used: sub.carousels_used, limit: sub.carousel_limit, reason: 'subscription_required' };
  }

  if (sub.carousels_used >= sub.carousel_limit) {
    return { allowed: false, used: sub.carousels_used, limit: sub.carousel_limit, reason: 'usage_limit_reached' };
  }

  return { allowed: true, used: sub.carousels_used, limit: sub.carousel_limit };
}

/** True only when the user has an active or trialing subscription. */
export async function hasActivePlan(userId: string): Promise<boolean> {
  const sub = await getSubscription(userId);
  return sub.status === 'active' || sub.status === 'trialing';
}

export async function incrementUsage(userId: string): Promise<void> {
  await getSupabase().rpc('increment_carousel_usage', { p_user_id: userId });
}

// Called by webhook — upserts subscription state from Stripe data
export async function upsertSubscription(data: Partial<Subscription> & { user_id: string }): Promise<void> {
  await getSupabase()
    .from('subscriptions')
    .upsert(data, { onConflict: 'user_id' });
}
