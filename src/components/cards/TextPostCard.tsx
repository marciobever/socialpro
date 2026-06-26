import React from 'react';
import type { ToneType, PlatformType } from '../../types';
import { MessageSquareText, Wand2, Loader2, Copy, Check } from 'lucide-react';

interface TextPostCardProps {
  platform: PlatformType;
  topic: string;
  onUpdateTopic: (topic: string) => void;
  tone: ToneType;
  onUpdateTone: (tone: ToneType) => void;
  content: string;
  onUpdateContent: (content: string) => void;
  isGenerating: boolean;
  onGenerate: () => void;
  onRefine: () => void;
  hideGenerator?: boolean;
}

const TONES: { id: ToneType; label: string; emoji: string }[] = [
  { id: 'provocativo', label: 'Provocativo', emoji: '🌶️' },
  { id: 'autoridade', label: 'Autoridade', emoji: '👔' },
  { id: 'storyteller', label: 'Storyteller', emoji: '📖' },
  { id: 'meme', label: 'Meme', emoji: '⚡' },
];

// X has a hard limit; LinkedIn allows much longer posts.
const LIMITS: Record<string, number> = { x: 280, linkedin: 3000 };

export const TextPostCard: React.FC<TextPostCardProps> = ({
  platform,
  topic,
  onUpdateTopic,
  tone,
  onUpdateTone,
  content,
  onUpdateContent,
  isGenerating,
  onGenerate,
  onRefine,
  hideGenerator = false,
}) => {
  const [copied, setCopied] = React.useState(false);
  const limit = LIMITS[platform] ?? 3000;
  const overLimit = content.length > limit;
  const label = platform === 'x' ? 'X / Twitter' : 'LinkedIn';
  const canGenerate = !isGenerating && topic.trim().length > 0;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-5 sm:p-6 space-y-6 border border-white/5">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="p-2 bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan rounded-xl">
          <MessageSquareText className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-display text-lg font-bold text-white tracking-tight">Post de texto · {label}</h3>
          <p className="text-xs text-dark-muted">A IA escreve um post pronto a partir do seu tema</p>
        </div>
      </div>

      {!hideGenerator && (
        /* Generation panel */
        <div className="rounded-2xl border border-accent-cyan/20 bg-gradient-to-br from-accent-cyan/[0.07] to-accent-purple/[0.03] p-4 space-y-3">
          <label className="flex items-center gap-1.5 text-[11px] font-bold text-white">
            <Wand2 className="h-3.5 w-3.5 text-accent-cyan" />
            Sobre o que é o post?
          </label>

          <input
            type="text"
            value={topic}
            onChange={(e) => onUpdateTopic(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && canGenerate) onGenerate(); }}
            disabled={isGenerating}
            className="interactive-input disabled:opacity-60"
            placeholder="Ex: por que consistência vence talento na criação de conteúdo"
          />

          <div className="flex flex-wrap gap-1.5">
            {TONES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => onUpdateTone(t.id)}
                disabled={isGenerating}
                className={`btn-press flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all disabled:opacity-50 ${
                  tone === t.id
                    ? 'border-accent-cyan bg-accent-cyan/15 text-white'
                    : 'bg-white/5 border-white/5 text-dark-muted hover:text-white hover:bg-white/10'
                }`}
              >
                <span>{t.emoji}</span>{t.label}
              </button>
            ))}
          </div>

          <button
            onClick={onGenerate}
            disabled={!canGenerate}
            className="btn-press w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-accent-cyan to-accent-purple shadow-[0_0_18px_rgba(6,182,212,0.35)] hover:shadow-[0_0_26px_rgba(6,182,212,0.55)] transition-all disabled:opacity-50 disabled:shadow-none"
          >
            {isGenerating ? (
              <><Loader2 className="h-4 w-4 animate-spin" />Escrevendo...</>
            ) : (
              <><Wand2 className="h-4 w-4" />Gerar post</>
            )}
          </button>
        </div>
      )}

      {/* Editable post */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold text-dark-muted tracking-wider">Texto do post</span>
          <span className={`text-[10px] font-mono ${overLimit ? 'text-accent-pink' : 'text-dark-muted'}`}>
            {content.length} / {limit}
          </span>
        </div>
        <textarea
          value={content}
          onChange={(e) => onUpdateContent(e.target.value)}
          className="interactive-input h-48 resize-none py-3 leading-relaxed"
          placeholder="O post aparece aqui ao gerar. Você pode editar livremente."
        />
        {overLimit && (
          <p className="text-[10px] text-accent-pink font-semibold animate-fade-in">
            ⚠️ Acima do limite do {label} ({limit} caracteres).
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
        <button
          onClick={onRefine}
          disabled={isGenerating || !content.trim()}
          className="btn-press flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11px] font-bold text-white bg-gradient-to-r from-accent-purple to-accent-cyan shadow-[0_0_14px_rgba(139,92,246,0.3)] hover:shadow-[0_0_22px_rgba(139,92,246,0.5)] transition-all disabled:opacity-50"
        >
          {isGenerating ? (
            <><Loader2 className="h-3.5 w-3.5 animate-spin" />Refinando...</>
          ) : (
            <><Wand2 className="h-3.5 w-3.5" />Refinar IA</>
          )}
        </button>
        <button
          onClick={handleCopy}
          disabled={!content.trim()}
          className="btn-press flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11px] font-bold bg-white/5 border border-white/5 hover:bg-white/10 text-white transition-all disabled:opacity-50"
        >
          {copied ? (
            <><Check className="h-3.5 w-3.5 text-emerald-400" />Copiado!</>
          ) : (
            <><Copy className="h-3.5 w-3.5 text-accent-cyan" />Copiar</>
          )}
        </button>
      </div>
    </div>
  );
};
