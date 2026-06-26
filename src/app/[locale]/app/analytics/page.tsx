"use client";
import React, { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import {
  BarChart2, TrendingUp, Heart, MessageCircle, Eye,
  Users, RefreshCw, Loader2, AlertCircle, ExternalLink,
  ChevronRight, BarChart3, HelpCircle,
} from 'lucide-react';

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
  );
}

interface MediaInsight {
  id: string;
  caption: string;
  timestamp: string;
  permalink: string;
  like_count: number;
  comments_count: number;
  reach: number;
  engagement_rate: number;
}

interface AccountInsight {
  followers_count: number;
  media_count: number;
  reach: number;
  impressions: number;
}

const spring = { type: 'spring' as const, stiffness: 400, damping: 30 };

export default function AnalyticsPage() {
  const t = useTranslations('analytics');
  const locale = useLocale();

  const [account, setAccount] = useState<AccountInsight | null>(null);
  const [media, setMedia] = useState<MediaInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/analytics/instagram');
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.error || 'Erro ao carregar os dados.');
      }
      const data = await res.json();
      setAccount(data.account ?? null);
      setMedia(data.media ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errorLoading') || 'Erro ao carregar.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const totalLikes = media.reduce((s, m) => s + (m.like_count || 0), 0);
  const totalComments = media.reduce((s, m) => s + (m.comments_count || 0), 0);
  const totalReach = media.reduce((s, m) => s + (m.reach || 0), 0);
  const avgEng = media.length > 0
    ? (media.reduce((s, m) => s + m.engagement_rate, 0) / media.length).toFixed(1)
    : '0';

  return (
    <div className="min-h-[calc(100vh-64px)] py-8 px-4 md:px-8 max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-text flex items-center gap-2">
            <BarChart2 className="h-6 w-6 text-accent-purple" />
            {t('title')}
          </h1>
          <p className="text-sm text-dark-muted mt-0.5">{t('subtitle')}</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/[0.08] bg-white/[0.03] text-xs text-dark-muted hover:text-white hover:border-white/[0.16] hover:bg-white/[0.05] transition-all disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          {t('refresh')}
        </button>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-purple/10 border border-accent-purple/20">
            <Loader2 className="h-6 w-6 animate-spin text-accent-purple" />
          </div>
        </div>
      )}

      {!loading && error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 space-y-5 text-center"
        >
          <div className="p-4 rounded-3xl bg-amber-500/10 border border-amber-500/20 shadow-lg shadow-amber-500/5">
            <AlertCircle className="h-8 w-8 text-amber-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">{t('notConnected')}</h3>
            <p className="text-sm text-dark-muted max-w-md">{error}</p>
          </div>
          <Link
            href="/app/account"
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-accent-purple to-accent-cyan hover:shadow-[0_0_16px_rgba(139,92,246,0.3)] transition-all"
          >
            {t('connectIg')}
          </Link>
        </motion.div>
      )}

      {!loading && !error && (
        <div className="space-y-8">
          {/* Section: Account Statistics */}
          {account && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <InstagramIcon className="h-4 w-4 text-pink-400" />
                <h2 className="text-xs font-bold text-white/35 uppercase tracking-[0.16em]">
                  {t('profileHeader')}
                </h2>
                <div className="h-px bg-white/[0.06] flex-1" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {
                    icon: Users,
                    label: t('followers'),
                    value: account.followers_count.toLocaleString(locale),
                    color: 'text-accent-purple',
                    bg: 'bg-accent-purple/10 border-accent-purple/20',
                    glow: 'hover:shadow-[0_0_15px_rgba(139,92,246,0.06)]',
                  },
                  {
                    icon: Eye,
                    label: t('reach30d'),
                    value: account.reach.toLocaleString(locale),
                    color: 'text-accent-cyan',
                    bg: 'bg-accent-cyan/10 border-accent-cyan/20',
                    glow: 'hover:shadow-[0_0_15px_rgba(6,182,212,0.06)]',
                  },
                  {
                    icon: TrendingUp,
                    label: t('impressions'),
                    value: account.impressions.toLocaleString(locale),
                    color: 'text-emerald-400',
                    bg: 'bg-emerald-500/10 border-emerald-500/20',
                    glow: 'hover:shadow-[0_0_15px_rgba(16,185,129,0.06)]',
                  },
                  {
                    icon: BarChart2,
                    label: t('publications'),
                    value: account.media_count.toLocaleString(locale),
                    color: 'text-white',
                    bg: 'bg-white/5 border-white/10',
                    glow: '',
                  },
                ].map(({ icon: Icon, label, value, color, bg, glow }) => (
                  <motion.div
                    key={label}
                    whileHover={{ y: -2 }}
                    transition={spring}
                    className={`bg-[#181b25]/40 border border-white/[0.08] hover:border-white/[0.14] rounded-2xl p-5 space-y-3 backdrop-blur-xl transition-all duration-300 ${glow}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl ${bg}`}>
                        <Icon className={`h-4 w-4 ${color}`} />
                      </div>
                      <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">
                        {label}
                      </span>
                    </div>
                    <p className={`text-2xl font-black ${color} tracking-tight`}>
                      {value}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Content Insights */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-4 w-4 text-accent-cyan" />
              <h2 className="text-xs font-bold text-white/35 uppercase tracking-[0.16em]">
                {t('engagementHeader')}
              </h2>
              <div className="h-px bg-white/[0.06] flex-1" />
            </div>

            {media.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {
                    icon: Heart,
                    label: t('totalLikes'),
                    value: totalLikes.toLocaleString(locale),
                    color: 'text-pink-400',
                    bg: 'bg-pink-500/10 border-pink-500/20',
                    glow: 'hover:shadow-[0_0_15px_rgba(236,72,153,0.06)]',
                  },
                  {
                    icon: MessageCircle,
                    label: t('comments'),
                    value: totalComments.toLocaleString(locale),
                    color: 'text-accent-cyan',
                    bg: 'bg-accent-cyan/10 border-accent-cyan/20',
                    glow: 'hover:shadow-[0_0_15px_rgba(6,182,212,0.06)]',
                  },
                  {
                    icon: Eye,
                    label: t('totalReach'),
                    value: totalReach.toLocaleString(locale),
                    color: 'text-emerald-400',
                    bg: 'bg-emerald-500/10 border-emerald-500/20',
                    glow: 'hover:shadow-[0_0_15px_rgba(16,185,129,0.06)]',
                  },
                  {
                    icon: TrendingUp,
                    label: t('avgEngagement'),
                    value: `${avgEng}%`,
                    color: 'text-accent-purple',
                    bg: 'bg-accent-purple/10 border-accent-purple/20',
                    glow: 'hover:shadow-[0_0_15px_rgba(139,92,246,0.06)]',
                  },
                ].map(({ icon: Icon, label, value, color, bg, glow }) => (
                  <motion.div
                    key={label}
                    whileHover={{ y: -2 }}
                    transition={spring}
                    className={`bg-[#181b25]/40 border border-white/[0.08] hover:border-white/[0.14] rounded-2xl p-5 space-y-3 backdrop-blur-xl transition-all duration-300 ${glow}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl ${bg}`}>
                        <Icon className={`h-4 w-4 ${color}`} />
                      </div>
                      <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">
                        {label}
                      </span>
                    </div>
                    <p className={`text-2xl font-black ${color} tracking-tight`}>
                      {value}
                    </p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-[#181b25]/20 border border-white/[0.06] rounded-2xl p-10 text-center text-sm text-dark-muted backdrop-blur-md">
                {t('noPosts')}
              </div>
            )}
          </div>

          {/* Section: Recent Posts */}
          {media.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <HelpCircle className="h-4 w-4 text-white/30" />
                <h2 className="text-xs font-bold text-white/35 uppercase tracking-[0.16em]">
                  {t('recentPosts')}
                </h2>
                <div className="h-px bg-white/[0.06] flex-1" />
              </div>

              <div className="space-y-3">
                {media.map((m) => (
                  <motion.div
                    key={m.id}
                    whileHover={{ x: 2 }}
                    className="bg-[#181b25]/40 border border-white/[0.08] hover:border-white/[0.14] rounded-2xl p-4 flex items-center justify-between gap-4 backdrop-blur-xl transition-all duration-200"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-bold leading-normal truncate max-w-lg">
                        {m.caption || t('noCaption')}
                      </p>
                      <p className="text-[10.5px] text-white/40 mt-1 font-medium">
                        {new Date(m.timestamp).toLocaleDateString(locale, {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>

                    <div className="flex items-center gap-6 text-[11px] font-semibold text-white/40 flex-shrink-0">
                      <div className="flex items-center gap-1.5">
                        <Heart className="h-3.5 w-3.5 text-pink-400" />
                        <span className="text-white/70">{m.like_count}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MessageCircle className="h-3.5 w-3.5 text-accent-cyan" />
                        <span className="text-white/70">{m.comments_count}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Eye className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-white/70">
                          {(m.reach || 0).toLocaleString(locale)}
                        </span>
                      </div>
                      <div className="hidden md:flex items-center gap-1.5">
                        <TrendingUp className="h-3.5 w-3.5 text-accent-purple" />
                        <span className="text-white/70">
                          {m.engagement_rate.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    {m.permalink && (
                      <a
                        href={m.permalink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl border border-white/[0.08] bg-white/[0.02] text-white/50 hover:text-white hover:border-white/25 hover:bg-white/[0.06] transition-all flex-shrink-0 cursor-pointer"
                        title="Ver no Instagram"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
