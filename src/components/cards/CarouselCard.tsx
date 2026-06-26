import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Slide, CarouselStyleModel, WatermarkType, ToneType } from '../../types';
import {
  Loader2, Wand2, Cpu, Sparkles, Lightbulb, ArrowRight, Sliders,
} from 'lucide-react';

interface CarouselCardProps {
  slides: Slide[];
  carouselTopic: string;
  onUpdateCarouselTopic: (topic: string) => void;
  carouselSlideCount: number;
  onUpdateCarouselSlideCount: (count: number) => void;
  isGeneratingCarousel: boolean;
  lastCarouselSource: 'ai' | 'fallback' | null;
  onGenerateCarousel: () => void;
  /** Opens the GenerateWizard (style → tweaks → review) */
  onOpenWizard: () => void;
  styleModel: CarouselStyleModel;
  onUpdateStyleModel: (model: CarouselStyleModel) => void;
  watermarkType: WatermarkType;
  onUpdateWatermarkType: (type: WatermarkType) => void;
  tone: ToneType;
  onUpdateTone: (tone: ToneType) => void;
  referenceImage: string | null;
  onUpdateReferenceImage: (img: string | null) => void;
  // kept for compat
  activeSlideIndex: number;
  onUpdateSlides: (slides: Slide[]) => void;
  onSetActiveSlide: (index: number) => void;
  brandName: string;
  brandHandle: string;
  avatarUrl: string;
  onRegenerateSlideImage: (slideId: string, title: string, subtitle: string, imagePrompt: string) => void;
}

const spring = { type: 'spring' as const, stiffness: 400, damping: 28 };
const ease = [0.16, 1, 0.3, 1] as const;

const TOPIC_EXAMPLES = [
  '5 erros que derrubam seu engajamento',
  '3 sinais de que sua copy está fraca',
  'Como criar um carrossel que prende atenção',
];

const GEN_PHASES = [
  'Pesquisando o tema…',
  'Gerando o roteiro…',
  'Montando a estrutura…',
  'Criando os slides…',
];

// Style name lookup for the summary badge
const STYLE_NAMES: Record<string, string> = {
  lifestyle: 'Lifestyle', tech: 'Cyber', alert: 'Alerta', minimalist: 'Minimal',
  feminino: 'Feminino', neutro: 'Neutro', retro: 'Retrô', aquarela: 'Aquarela', neon: 'Neon',
  infantil: 'Infantil', pixar: '3D Pixar', anime: 'Anime', flat: 'Flat Art', cartoon: 'Cartoon',
};

// Tone emoji lookup for the summary badge
const TONE_EMOJI: Record<string, string> = {
  provocativo: '🌶️', autoridade: '👔', storyteller: '📖', meme: '⚡',
};

export const CarouselCard: React.FC<CarouselCardProps> = ({
  slides,
  carouselTopic, onUpdateCarouselTopic,
  carouselSlideCount,
  isGeneratingCarousel, lastCarouselSource,
  onOpenWizard,
  styleModel, tone, referenceImage,
}) => {
  const [phaseIdx, setPhaseIdx] = React.useState(0);

  // Cycle loading phase labels while generating
  React.useEffect(() => {
    if (!isGeneratingCarousel) { setPhaseIdx(0); return; }
    const id = setInterval(() => setPhaseIdx(i => Math.min(i + 1, GEN_PHASES.length - 1)), 2200);
    return () => clearInterval(id);
  }, [isGeneratingCarousel]);

  const imagesReady   = slides.filter(s => s.imageUrl).length;
  const isAnyGenerating = slides.some(s => s.isGeneratingImage);
  const canOpenWizard = !isGeneratingCarousel && carouselTopic.trim().length > 0;
  const charCount     = carouselTopic.trim().length;
  const hasSlides     = slides.length > 0;

  return (
    <div className="rounded-3xl overflow-hidden border border-white/[0.07] focus-within:border-accent-purple/30 transition-colors w-full" style={{ background: '#181b25' }}>

      {/* ── Header: model status ── */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.015] select-none">
        <div className="flex items-center gap-2">
          <Cpu className="h-3.5 w-3.5 text-accent-purple" />
          <span className="text-[10px] font-bold text-white/55 uppercase tracking-[0.14em]">gpt-image-2</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
        </div>
        <div className="flex items-center gap-3 text-[9px]">
          {isAnyGenerating && <span className="text-accent-cyan animate-pulse font-semibold">Gerando imagens...</span>}
          {!isAnyGenerating && imagesReady > 0 && <span className="text-emerald-400 font-semibold">✓ {imagesReady}/{slides.length} prontos</span>}
          {lastCarouselSource && !isGeneratingCarousel && !isAnyGenerating && (
            <span className={lastCarouselSource === 'ai' ? 'text-accent-cyan font-semibold' : 'text-amber-400 font-semibold'}>
              {lastCarouselSource === 'ai' ? '✨ IA + pesquisa' : '⚡ offline'}
            </span>
          )}
        </div>
      </div>

      <div className="px-4 pt-4 pb-4 space-y-4">

        {/* ─────────────── Tema / briefing ─────────────── */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-white/70">
              <Wand2 className="h-3.5 w-3.5 text-accent-cyan" />
              Tema do carrossel
            </span>
            {charCount > 0 && <span className="text-[10px] text-white/30">{charCount} car.</span>}
          </div>

          <div className="rounded-2xl border border-accent-purple/[0.18] bg-gradient-to-br from-accent-purple/[0.06] to-accent-cyan/[0.02] p-3 focus-within:border-accent-purple/40 transition-colors">
            <textarea
              value={carouselTopic}
              onChange={e => onUpdateCarouselTopic(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey && canOpenWizard) {
                  e.preventDefault();
                  onOpenWizard();
                }
              }}
              disabled={isGeneratingCarousel}
              rows={3}
              className="w-full bg-transparent border-none outline-none resize-none text-white placeholder:text-white/30 font-medium text-sm leading-relaxed disabled:opacity-60"
              placeholder="Descreva o tema do seu carrossel. Quanto mais específico, melhor o resultado."
            />
          </div>

          {/* Helper + example suggestions */}
          <div className="space-y-1.5">
            <span className="flex items-center gap-1 text-[10px] text-white/35">
              <Lightbulb className="h-3 w-3 text-amber-400/80" />
              Sem ideia? Comece por um destes:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {TOPIC_EXAMPLES.map(ex => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => onUpdateCarouselTopic(ex)}
                  disabled={isGeneratingCarousel}
                  className="text-left text-[10px] leading-tight px-2.5 py-1.5 rounded-lg border border-white/[0.07] bg-white/[0.02] text-white/45 hover:text-white/85 hover:border-accent-cyan/30 hover:bg-accent-cyan/[0.04] transition-all disabled:opacity-50 cursor-pointer"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ─────────────── Summary badge — mostra quando há slides ─────────────── */}
        <AnimatePresence>
          {hasSlides && !isGeneratingCarousel && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease }}
              className="overflow-hidden"
            >
              <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.07]">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Config</span>
                  <span className="text-[10px] font-semibold text-white/60 bg-white/[0.06] px-2 py-0.5 rounded-md">
                    {STYLE_NAMES[styleModel] ?? styleModel}
                  </span>
                  <span className="text-[10px] font-semibold text-white/60 bg-white/[0.06] px-2 py-0.5 rounded-md">
                    {TONE_EMOJI[tone] ?? ''} {tone}
                  </span>
                  <span className="text-[10px] font-semibold text-white/60 bg-white/[0.06] px-2 py-0.5 rounded-md">
                    {carouselSlideCount} slides
                  </span>
                  {referenceImage && (
                    <span className="text-[10px] font-semibold text-accent-cyan/70 bg-accent-cyan/[0.07] px-2 py-0.5 rounded-md border border-accent-cyan/15">
                      ref. ativa
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onOpenWizard}
                  className="flex items-center gap-1 text-[10px] font-bold text-white/45 hover:text-accent-purple transition-colors cursor-pointer flex-shrink-0"
                  title="Ajustar configurações"
                >
                  <Sliders className="h-3 w-3" />
                  Ajustar
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─────────────── CTA: Criar carrossel (abre o Wizard) ─────────────── */}
        <div className="space-y-2 pt-1">
          <motion.button
            onClick={onOpenWizard}
            disabled={isGeneratingCarousel || (!canOpenWizard && !hasSlides)}
            whileHover={canOpenWizard || hasSlides ? { scale: 1.015 } : undefined}
            whileTap={canOpenWizard || hasSlides ? { scale: 0.98 } : undefined}
            transition={spring}
            className={`relative w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[13px] font-bold text-white overflow-hidden transition-all ${
              isGeneratingCarousel
                ? 'bg-gradient-to-r from-accent-purple to-accent-cyan shadow-[0_0_28px_rgba(139,92,246,0.5)] cursor-wait'
                : canOpenWizard || hasSlides
                  ? 'bg-gradient-to-r from-accent-purple to-accent-cyan shadow-[0_6px_24px_rgba(139,92,246,0.35)] hover:shadow-[0_8px_32px_rgba(139,92,246,0.55)] cursor-pointer'
                  : 'bg-white/[0.05] border border-white/[0.08] text-white/30 cursor-not-allowed'
            }`}
          >
            {/* Shimmer sweep while generating */}
            {isGeneratingCarousel && (
              <span className="absolute inset-0 shimmer opacity-40 pointer-events-none" />
            )}
            <span className="relative z-10 flex items-center gap-2">
              {isGeneratingCarousel ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={phaseIdx}
                      initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.25, ease }}
                    >
                      {GEN_PHASES[phaseIdx]}
                    </motion.span>
                  </AnimatePresence>
                </>
              ) : hasSlides ? (
                <><Sparkles className="h-4 w-4" /> Refazer carrossel<ArrowRight className="h-3.5 w-3.5 opacity-70" /></>
              ) : (
                <><Wand2 className="h-4 w-4" /> Criar carrossel<ArrowRight className="h-3.5 w-3.5 opacity-70" /></>
              )}
            </span>
          </motion.button>

          {/* Contextual helper below CTA */}
          {!isGeneratingCarousel && (
            <p className="text-[10px] text-center text-white/30">
              {canOpenWizard || hasSlides
                ? <>Escolha o estilo, ajuste o tom e gere com IA</>
                : 'Descreva o tema acima para liberar a criação'}
            </p>
          )}
        </div>

      </div>
    </div>
  );
};
