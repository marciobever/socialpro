"use client";
import React, { useState, useEffect } from 'react';
import { BarChart2, TrendingUp, Heart, MessageCircle, Eye, Users, RefreshCw, Loader2, AlertCircle, ExternalLink } from 'lucide-react';

interface MediaInsight {
  id: string; caption: string; timestamp: string; permalink: string;
  like_count: number; comments_count: number; reach: number; engagement_rate: number;
}
interface AccountInsight {
  followers_count: number; media_count: number; reach: number; impressions: number;
}

export default function AnalyticsPage() {
  const [account, setAccount] = useState<AccountInsight | null>(null);
  const [media, setMedia] = useState<MediaInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/analytics/instagram');
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Erro'); }
      const data = await res.json();
      setAccount(data.account ?? null);
      setMedia(data.media ?? []);
    } catch (err) { setError(err instanceof Error ? err.message : 'Erro ao carregar.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const totalLikes    = media.reduce((s, m) => s + (m.like_count || 0), 0);
  const totalComments = media.reduce((s, m) => s + (m.comments_count || 0), 0);
  const totalReach    = media.reduce((s, m) => s + (m.reach || 0), 0);
  const avgEng        = media.length > 0 ? (media.reduce((s, m) => s + m.engagement_rate, 0) / media.length).toFixed(1) : '0';

  return (
    <div className="min-h-[calc(100vh-64px)] py-8 px-4 md:px-8 max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-text flex items-center gap-2">
            <BarChart2 className="h-6 w-6 text-accent-purple" />Analytics
          </h1>
          <p className="text-sm text-dark-muted mt-0.5">Performance dos seus posts no Instagram</p>
        </div>
        <button onClick={load} disabled={loading} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dark-border text-xs text-dark-muted hover:text-dark-text hover:bg-white/5 transition-all disabled:opacity-50">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />Atualizar
        </button>
      </div>

      {loading && <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-accent-purple" /></div>}

      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20"><AlertCircle className="h-8 w-8 text-amber-400" /></div>
          <p className="text-sm text-dark-muted max-w-sm">{error}</p>
          <a href="/app/account" className="text-xs text-accent-cyan hover:underline">Conectar Instagram →</a>
        </div>
      )}

      {!loading && !error && <>
        {account && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Users, label: 'Seguidores', value: account.followers_count.toLocaleString('pt-BR'), color: 'text-accent-purple' },
              { icon: Eye, label: 'Alcance (30d)', value: account.reach.toLocaleString('pt-BR'), color: 'text-accent-cyan' },
              { icon: TrendingUp, label: 'Impressões', value: account.impressions.toLocaleString('pt-BR'), color: 'text-emerald-400' },
              { icon: BarChart2, label: 'Publicações', value: account.media_count.toLocaleString('pt-BR'), color: 'text-white' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="glass-panel rounded-2xl border border-dark-border p-4 space-y-2">
                <div className="flex items-center gap-2"><Icon className={`h-4 w-4 ${color}`} /><span className="text-[10px] text-dark-muted font-semibold">{label}</span></div>
                <p className={`text-2xl font-black ${color}`}>{value}</p>
              </div>
            ))}
          </div>
        )}
        {media.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Heart, label: 'Total likes', value: totalLikes.toLocaleString('pt-BR'), color: 'text-accent-pink' },
              { icon: MessageCircle, label: 'Comentários', value: totalComments.toLocaleString('pt-BR'), color: 'text-accent-cyan' },
              { icon: Eye, label: 'Alcance total', value: totalReach.toLocaleString('pt-BR'), color: 'text-emerald-400' },
              { icon: TrendingUp, label: 'Eng. médio', value: `${avgEng}%`, color: 'text-accent-purple' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="glass-panel rounded-2xl border border-dark-border p-4 space-y-2">
                <div className="flex items-center gap-2"><Icon className={`h-4 w-4 ${color}`} /><span className="text-[10px] text-dark-muted font-semibold">{label}</span></div>
                <p className={`text-xl font-black ${color}`}>{value}</p>
              </div>
            ))}
          </div>
        )}
        {media.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-dark-text">Posts recentes</h2>
            {media.map(m => (
              <div key={m.id} className="glass-panel rounded-2xl border border-dark-border p-4 flex items-center gap-4 hover:border-white/10 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-dark-text font-semibold line-clamp-1">{m.caption || 'Sem legenda'}</p>
                  <p className="text-[10px] text-dark-muted mt-0.5">{new Date(m.timestamp).toLocaleDateString('pt-BR')}</p>
                </div>
                <div className="flex items-center gap-4 text-[10px] text-dark-muted flex-shrink-0">
                  <div className="flex items-center gap-1"><Heart className="h-3 w-3 text-accent-pink" />{m.like_count}</div>
                  <div className="flex items-center gap-1"><MessageCircle className="h-3 w-3 text-accent-cyan" />{m.comments_count}</div>
                  <div className="flex items-center gap-1"><Eye className="h-3 w-3 text-emerald-400" />{(m.reach || 0).toLocaleString('pt-BR')}</div>
                  <div className="hidden md:flex items-center gap-1"><TrendingUp className="h-3 w-3 text-accent-purple" />{m.engagement_rate.toFixed(1)}%</div>
                </div>
                {m.permalink && (
                  <a href={m.permalink} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg text-dark-muted hover:text-accent-cyan transition-colors flex-shrink-0">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
        {media.length === 0 && !error && (
          <div className="text-center py-12 text-sm text-dark-muted">Nenhum post encontrado. Publique carrosséis para ver as métricas aqui.</div>
        )}
      </>}
    </div>
  );
}
