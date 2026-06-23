import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const userId = session.user.email ?? '';

  // Get Instagram connection
  const { data: conn } = await getSupabase()
    .from('social_connections')
    .select('access_token, instagram_account_id')
    .eq('user_id', userId)
    .eq('provider', 'instagram')
    .maybeSingle();

  if (!conn?.access_token || !conn?.instagram_account_id) {
    return NextResponse.json({ error: 'Instagram não conectado. Vá em Conta → Contas Conectadas.' }, { status: 400 });
  }

  const { access_token: token, instagram_account_id: igId } = conn;
  const BASE = 'https://graph.facebook.com/v21.0';

  try {
    // Account basic info
    const accountRes = await fetch(
      `${BASE}/${igId}?fields=followers_count,media_count&access_token=${token}`
    );
    const accountData = await accountRes.json();

    // Account insights (reach, impressions last 30 days)
    const insightsRes = await fetch(
      `${BASE}/${igId}/insights?metric=reach,impressions,profile_views&period=day&since=${Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000)}&until=${Math.floor(Date.now() / 1000)}&access_token=${token}`
    );
    const insightsData = await insightsRes.json();

    // Sum insights
    let totalReach = 0, totalImpressions = 0, totalProfileViews = 0;
    if (Array.isArray(insightsData.data)) {
      insightsData.data.forEach((metric: { name: string; values: { value: number }[] }) => {
        const sum = metric.values.reduce((s: number, v: { value: number }) => s + (v.value || 0), 0);
        if (metric.name === 'reach') totalReach = sum;
        if (metric.name === 'impressions') totalImpressions = sum;
        if (metric.name === 'profile_views') totalProfileViews = sum;
      });
    }

    // Recent media with insights
    const mediaRes = await fetch(
      `${BASE}/${igId}/media?fields=id,caption,media_type,timestamp,permalink,like_count,comments_count&limit=20&access_token=${token}`
    );
    const mediaData = await mediaRes.json();

    const media = await Promise.all(
      (mediaData.data ?? []).map(async (m: { id: string; caption?: string; media_type: string; timestamp: string; permalink?: string; like_count?: number; comments_count?: number }) => {
        try {
          const insRes = await fetch(
            `${BASE}/${m.id}/insights?metric=reach,impressions,saved,shares&access_token=${token}`
          );
          const ins = await insRes.json();
          const metrics: Record<string, number> = {};
          (ins.data ?? []).forEach((d: { name: string; values: { value: number }[] }) => {
            metrics[d.name] = d.values?.[0]?.value ?? 0;
          });

          const likes    = m.like_count    || 0;
          const comments = m.comments_count || 0;
          const reach    = metrics.reach    || 0;
          const engRate  = reach > 0 ? ((likes + comments) / reach) * 100 : 0;

          return {
            id:              m.id,
            caption:         m.caption ?? '',
            media_type:      m.media_type,
            timestamp:       m.timestamp,
            permalink:       m.permalink ?? '',
            like_count:      likes,
            comments_count:  comments,
            reach,
            impressions:     metrics.impressions || 0,
            saved:           metrics.saved       || 0,
            shares:          metrics.shares      || 0,
            engagement_rate: parseFloat(engRate.toFixed(2)),
          };
        } catch {
          return {
            id: m.id, caption: m.caption ?? '', media_type: m.media_type,
            timestamp: m.timestamp, permalink: m.permalink ?? '',
            like_count: m.like_count || 0, comments_count: m.comments_count || 0,
            reach: 0, impressions: 0, saved: 0, shares: 0, engagement_rate: 0,
          };
        }
      })
    );

    return NextResponse.json({
      account: {
        followers_count: accountData.followers_count || 0,
        media_count:     accountData.media_count     || 0,
        reach:           totalReach,
        impressions:     totalImpressions,
        profile_views:   totalProfileViews,
      },
      media,
    });
  } catch (err) {
    console.error('[analytics/instagram]', err);
    return NextResponse.json({ error: 'Erro ao buscar dados do Instagram.' }, { status: 500 });
  }
}
