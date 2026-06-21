"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, ImageIcon, Loader2, RefreshCw, Sparkles, ExternalLink } from 'lucide-react';

interface CarouselSummary {
  id: string;
  topic: string;
  tone: string;
  style: string;
  slide_count: number;
  caption: string | null;
  cover_image_url: string | null;
  status: 'draft' | 'published';
  platform: string;
  created_at: string;
}

const TONE_LABELS: Record<string, string> = {
  provocativo: '🌶️ Provocativo',
  autoridade:  '👔 Autoridade',
  storyteller: '📖 Storyteller',
  meme:        '⚡ Meme',
};

const PLATFORM_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  linkedin:  'LinkedIn',
  x:         'X / Twitter',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function HistoryPage() {
  const router = useRouter();
  const [carousels, setCarousels] = useState<CarouselSummary[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/carousels');
      if (!res.ok) throw new Error('Erro ao buscar histórico.');
      const json = await res.json();
      setCarousels(json.carousels ?? []);
    } catch {
      setError('Não foi possível carregar o histórico. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-dark-bg text-dark-text px-4 md:px-8 py-8 max-w-screen-xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2">
            <Clock className="h-6 w-6 text-accent-purple" />
            Histórico de Carrosséis
          </h1>
          <p className="text-sm text-dark-muted">Todos os carrosséis gerados na sua conta.</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dark-border bg-white/5 hover:bg-white/10 text-xs font-semibold text-dark-muted hover:text-dark-text transition-all disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-accent-purple" />
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="text-center py-20 space-y-3">
          <p className="text-sm text-accent-pink">{error}</p>
          <button onClick={load} className="text-xs text-accent-cyan underline">Tentar novamente</button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && carousels.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 space-y-4 text-center">
          <div className="p-4 rounded-2xl bg-accent-purple/10 border border-accent-purple/20">
            <Sparkles className="h-8 w-8 text-accent-purple" />
          </div>
          <h2 className="text-lg font-bold text-white">Nenhum carrossel ainda</h2>
          <p className="text-sm text-dark-muted max-w-sm">
            Crie seu primeiro carrossel no Estúdio e ele aparecerá aqui.
          </p>
          <button
            onClick={() => router.push('/app/dashboard')}
            className="mt-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-accent-purple to-accent-cyan text-sm font-bold text-white"
          >
            Ir para o Estúdio
          </button>
        </div>
      )}

      {/* Grid */}
      {!loading && !error && carousels.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {carousels.map((c) => (
            <div
              key={c.id}
              className="group glass-panel rounded-2xl border border-white/5 bg-white/[0.01] overflow-hidden hover:border-accent-purple/30 hover:-translate-y-0.5 transition-all duration-200"
            >
              {/* Cover / Placeholder */}
              <div className="relative aspect-square bg-[#090a0f] border-b border-white/5 overflow-hidden">
                {c.cover_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.cover_image_url}
                    alt={c.topic}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-dark-muted">
                    <ImageIcon className="h-8 w-8 opacity-30" />
                    <span className="text-[10px] font-semibold opacity-40">Sem imagem</span>
                  </div>
                )}

                {/* Status badge */}
                <span className={`absolute top-2 right-2 text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-full border tracking-wider ${
                  c.status === 'published'
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                    : 'bg-white/5 border-white/10 text-dark-muted'
                }`}>
                  {c.status === 'published' ? 'Publicado' : 'Rascunho'}
                </span>

                {/* Slide count */}
                <span className="absolute bottom-2 left-2 text-[8px] font-bold bg-black/60 backdrop-blur-sm border border-white/10 px-2 py-0.5 rounded-full text-dark-muted">
                  {c.slide_count} slides
                </span>
              </div>

              {/* Info */}
              <div className="p-4 space-y-3">
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-white leading-snug line-clamp-2">{c.topic}</h3>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[9px] text-accent-cyan font-semibold">
                      {TONE_LABELS[c.tone] ?? c.tone}
                    </span>
                    <span className="text-dark-muted opacity-30">·</span>
                    <span className="text-[9px] text-dark-muted">
                      {PLATFORM_LABELS[c.platform] ?? c.platform}
                    </span>
                  </div>
                </div>

                {c.caption && (
                  <p className="text-[9px] text-dark-muted leading-relaxed line-clamp-2 italic">
                    {c.caption}
                  </p>
                )}

                <div className="flex items-center justify-between pt-1 border-t border-white/5">
                  <span className="text-[8px] text-dark-muted">{formatDate(c.created_at)}</span>
                  <button
                    onClick={() => router.push(`/app/dashboard?load=${c.id}`)}
                    className="flex items-center gap-1 text-[8px] font-bold text-accent-purple hover:text-accent-cyan transition-colors"
                  >
                    Abrir <ExternalLink className="h-2.5 w-2.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
