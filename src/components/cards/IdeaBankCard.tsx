import React, { useState } from 'react';
import { Lightbulb, Loader2, Sparkles, ArrowRight, RefreshCw } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

interface AiIdea {
  title:  string;
  hook:   string;
  why:    string;
  slides: number;
  tone:   string;
}

const STATIC_IDEAS: AiIdea[] = [
  { title: 'A VERDADE QUE NINGUÉM TE CONTA',   hook: 'A maioria dos criadores está errando. Eles postam muito e crescem pouco.', why: 'Contrarian hook — para o scroll imediatamente', slides: 5, tone: 'provocativo' },
  { title: 'DE ZERO A 10K SEGUIDORES',          hook: 'Como construí uma audiência do zero em 90 dias sem comprar seguidores.', why: 'Resultado concreto + prazo curto = curiosidade', slides: 7, tone: 'autoridade' },
  { title: 'OS 5 ERROS QUE ME CUSTARAM CARO',   hook: 'Passei 3 anos cometendo esses erros antes de descobrir o que realmente funciona.', why: 'Identificação + urgência de aprender', slides: 5, tone: 'storyteller' },
];

interface IdeaBankCardProps {
  onSelectIdea: (hook: string, structure: string) => void;
}

export const IdeaBankCard: React.FC<IdeaBankCardProps> = ({ onSelectIdea }) => {
  const { brandKit, tone } = useAppContext();
  const [ideas,      setIdeas]      = useState<AiIdea[]>(STATIC_IDEAS);
  const [niche,      setNiche]      = useState('');
  const [loading,    setLoading]    = useState(false);
  const [applied,    setApplied]    = useState<string | null>(null);

  const generateIdeas = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche: niche || brandKit.aiBio || 'marketing digital', tone, aiBio: brandKit.aiBio }),
      });
      if (res.ok) {
        const { ideas: ai } = await res.json();
        if (Array.isArray(ai) && ai.length) setIdeas(ai);
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const handleSelect = (idea: AiIdea) => {
    setApplied(idea.title);
    onSelectIdea(idea.hook, `Carrossel de ${idea.slides} slides — Tom: ${idea.tone}`);
    setTimeout(() => setApplied(null), 1500);
  };

  return (
    <div className="glass-panel bento-card p-5 rounded-3xl col-span-1 flex flex-col gap-4 min-h-[240px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-accent-orange/10 border border-accent-orange/20 text-accent-orange rounded-xl">
            <Lightbulb className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-display text-sm font-bold text-white">Banco de Ideias</h3>
            <p className="text-[10px] text-dark-muted">Temas virais gerados por IA</p>
          </div>
        </div>
        <button onClick={generateIdeas} disabled={loading}
          className="p-1.5 rounded-lg text-dark-muted hover:text-accent-orange hover:bg-accent-orange/10 transition-all disabled:opacity-50">
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Niche input */}
      <div className="flex gap-2">
        <input
          value={niche}
          onChange={e => setNiche(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && generateIdeas()}
          placeholder="Seu nicho (ex: festas infantis)"
          className="interactive-input flex-1 text-[11px] py-1.5"
        />
        <button onClick={generateIdeas} disabled={loading}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold text-white bg-gradient-to-r from-accent-orange to-accent-pink disabled:opacity-50 transition-all hover:shadow-[0_0_10px_rgba(249,115,22,0.4)]">
          <Sparkles className="h-3 w-3" />
          Gerar
        </button>
      </div>

      {/* Ideas list */}
      <div className="space-y-2 flex-1">
        {loading && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-accent-orange" />
          </div>
        )}
        {!loading && ideas.slice(0, 4).map((idea, i) => (
          <button key={i} onClick={() => handleSelect(idea)}
            className={`w-full p-2.5 rounded-xl border flex items-start justify-between gap-2 transition-all text-left group ${
              applied === idea.title
                ? 'border-accent-orange bg-accent-orange/10'
                : 'bg-white/[0.02] border-white/5 hover:bg-white/5 hover:border-accent-orange/30'
            }`}>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-white truncate">{idea.title}</p>
              <p className="text-[9px] text-dark-muted mt-0.5 line-clamp-1 italic">"{idea.hook}"</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[8px] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-dark-muted">{idea.slides} slides</span>
                <span className="text-[8px] text-accent-orange capitalize">{idea.tone}</span>
              </div>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-dark-muted group-hover:text-accent-orange group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
          </button>
        ))}
      </div>
    </div>
  );
};
