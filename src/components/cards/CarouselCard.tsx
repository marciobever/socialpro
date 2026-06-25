import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Slide, CarouselStyleModel, WatermarkType, ToneType } from '../../types';
import {
  Loader2, Wand2, Cpu, ImagePlus, X, Sparkles, Lightbulb, Check,
} from 'lucide-react';
import { toast } from '@/components/Toast';

interface CarouselCardProps {
  slides: Slide[];
  carouselTopic: string;
  onUpdateCarouselTopic: (topic: string) => void;
  carouselSlideCount: number;
  onUpdateCarouselSlideCount: (count: number) => void;
  isGeneratingCarousel: boolean;
  lastCarouselSource: 'ai' | 'fallback' | null;
  onGenerateCarousel: () => void;
  styleModel: CarouselStyleModel;
  onUpdateStyleModel: (model: CarouselStyleModel) => void;
  watermarkType: WatermarkType;
  onUpdateWatermarkType: (type: WatermarkType) => void;
  tone: ToneType;
  onUpdateTone: (tone: ToneType) => void;
  referenceImage: string | null;
  onUpdateReferenceImage: (img: string | null) => void;
  // unused but kept for compat
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

const TONES: { id: ToneType; label: string; emoji: string; desc: string }[] = [
  { id: 'provocativo', label: 'Provocativo', emoji: '🌶️', desc: 'Quebra padrões e gera reação' },
  { id: 'autoridade',  label: 'Autoridade',  emoji: '👔',  desc: 'Dados e credibilidade' },
  { id: 'storyteller', label: 'Storyteller', emoji: '📖', desc: 'Narrativa e conexão emocional' },
  { id: 'meme',        label: 'Meme',        emoji: '⚡',  desc: 'Humor e identificação' },
];

const SLIDE_COUNTS = [3, 5, 8, 10, 12, 16];

const WATERMARK_OPTIONS: { id: WatermarkType; label: string }[] = [
  { id: 'both',   label: 'Nome + @' },
  { id: 'handle', label: 'Só @' },
  { id: 'none',   label: 'Sem marca' },
];

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

// ── Small section label ───────────────────────────────────────────────────────
function FieldLabel({ icon, children, hint }: { icon?: React.ReactNode; children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-1.5 text-[11px] font-bold text-white/70">
        {icon}{children}
      </span>
      {hint && <span className="text-[10px] text-white/30">{hint}</span>}
    </div>
  );
}

export const CarouselCard: React.FC<CarouselCardProps> = ({
  slides,
  carouselTopic, onUpdateCarouselTopic,
  carouselSlideCount, onUpdateCarouselSlideCount,
  isGeneratingCarousel, lastCarouselSource, onGenerateCarousel,
  watermarkType, onUpdateWatermarkType,
  tone, onUpdateTone,
  referenceImage, onUpdateReferenceImage,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = React.useState(false);
  const [phaseIdx, setPhaseIdx] = React.useState(0);

  // Cycle loading phase labels while generating
  React.useEffect(() => {
    if (!isGeneratingCarousel) { setPhaseIdx(0); return; }
    const id = setInterval(() => setPhaseIdx(i => Math.min(i + 1, GEN_PHASES.length - 1)), 2200);
    return () => clearInterval(id);
  }, [isGeneratingCarousel]);

  const readFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Arquivo inválido', 'Envie uma imagem PNG, JPG ou WebP.'); return; }
    const reader = new FileReader();
    reader.onload = () => { onUpdateReferenceImage(reader.result as string); toast.success('Imagem enviada', 'Será usada como referência visual'); };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    readFile(e.target.files?.[0]);
    e.target.value = ''; // reset so same file can be re-selected
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (isGeneratingCarousel) return;
    readFile(e.dataTransfer.files?.[0]);
  };

  const imagesReady   = slides.filter(s => s.imageUrl).length;
  const isAnyGenerating = slides.some(s => s.isGeneratingImage);
  const canGenerate   = !isGeneratingCarousel && carouselTopic.trim().length > 0;
  const currentTone   = TONES.find(t => t.id === tone) ?? TONES[0];
  const charCount     = carouselTopic.trim().length;

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

        {/* ─────────────── 3.3 — Tema / briefing ─────────────── */}
        <div className="space-y-2">
          <FieldLabel icon={<Wand2 className="h-3.5 w-3.5 text-accent-cyan" />} hint={charCount > 0 ? `${charCount} car.` : undefined}>
            Tema do carrossel
          </FieldLabel>

          <div className="rounded-2xl border border-accent-purple/[0.18] bg-gradient-to-br from-accent-purple/[0.06] to-accent-cyan/[0.02] p-3 focus-within:border-accent-purple/40 transition-colors">
            <textarea
              value={carouselTopic}
              onChange={e => onUpdateCarouselTopic(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && canGenerate) { e.preventDefault(); onGenerateCarousel(); } }}
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

        {/* ─────────────── 3.4 — Imagem de referência ─────────────── */}
        <div className="space-y-2">
          <FieldLabel icon={<ImagePlus className="h-3.5 w-3.5 text-white/40" />} hint="opcional">
            Imagem de referência
          </FieldLabel>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handleFileChange}
            disabled={isGeneratingCarousel}
          />

          <AnimatePresence mode="wait">
            {referenceImage ? (
              <motion.div
                key="preview"
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease }}
                className="flex items-center gap-3 p-2.5 rounded-2xl bg-accent-purple/[0.06] border border-accent-purple/30"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={referenceImage} alt="Referência" className="h-12 w-12 rounded-xl object-cover border border-white/10 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-accent-cyan flex items-center gap-1">
                    <Check className="h-3 w-3" /> Referência ativa
                  </p>
                  <p className="text-[10px] text-white/40 leading-snug">A IA seguirá esta estética em todos os slides</p>
                </div>
                <div className="flex flex-col gap-1 flex-shrink-0">
                  <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isGeneratingCarousel}
                    className="text-[9px] font-bold px-2 py-1 rounded-lg border border-white/[0.08] text-white/50 hover:text-white hover:border-white/[0.18] transition-all disabled:opacity-50 cursor-pointer">
                    Trocar
                  </button>
                  <button type="button" onClick={() => onUpdateReferenceImage(null)} disabled={isGeneratingCarousel}
                    className="text-[9px] font-bold px-2 py-1 rounded-lg border border-white/[0.08] text-white/40 hover:text-rose-400 hover:border-rose-500/30 transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1">
                    <X className="h-2.5 w-2.5" /> Remover
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.button
                key="dropzone"
                type="button"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); if (!isGeneratingCarousel) setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                disabled={isGeneratingCarousel}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className={`w-full flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed px-3 py-4 transition-all disabled:opacity-50 cursor-pointer ${
                  dragOver
                    ? 'border-accent-purple/60 bg-accent-purple/[0.08]'
                    : 'border-white/[0.10] bg-white/[0.015] hover:border-accent-purple/40 hover:bg-accent-purple/[0.04]'
                }`}
              >
                <ImagePlus className={`h-5 w-5 transition-colors ${dragOver ? 'text-accent-purple' : 'text-white/35'}`} />
                <span className="text-[11px] font-semibold text-white/60">Arraste ou clique para enviar</span>
                <span className="text-[9.5px] text-white/30 text-center leading-snug max-w-[200px]">
                  Use uma imagem se quiser que a IA siga uma composição, estética ou identidade visual parecida.
                </span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <div className="h-px bg-white/[0.06]" />

        {/* ─────────────── 3.5 — Tom de voz ─────────────── */}
        <div className="space-y-2">
          <FieldLabel icon={<Sparkles className="h-3.5 w-3.5 text-accent-purple" />}>Tom de voz</FieldLabel>
          <div className="grid grid-cols-2 gap-1.5">
            {TONES.map(tn => {
              const active = tone === tn.id;
              return (
                <motion.button
                  key={tn.id}
                  type="button"
                  onClick={() => onUpdateTone(tn.id)}
                  disabled={isGeneratingCarousel}
                  whileTap={{ scale: 0.96 }}
                  transition={spring}
                  className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-[11px] font-semibold border transition-all disabled:opacity-50 cursor-pointer ${
                    active
                      ? 'border-accent-purple/60 bg-accent-purple/[0.14] text-white shadow-[0_0_0_1px_rgba(139,92,246,0.3)]'
                      : 'border-white/[0.07] bg-white/[0.03] text-white/45 hover:text-white/85 hover:border-white/[0.16]'
                  }`}
                >
                  <span className="text-[13px] leading-none">{tn.emoji}</span>
                  {tn.label}
                </motion.button>
              );
            })}
          </div>
          {/* Active tone description */}
          <AnimatePresence mode="wait">
            <motion.p
              key={currentTone.id}
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2, ease }}
              className="text-[10px] text-white/40 px-0.5"
            >
              {currentTone.emoji} <span className="font-semibold text-white/55">{currentTone.label}:</span> {currentTone.desc}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* ─────────────── 3.6 — Quantidade de slides ─────────────── */}
        <div className="space-y-2">
          <FieldLabel hint={`${carouselSlideCount} slides`}>Quantidade de slides</FieldLabel>
          <div className="flex gap-1 p-1 rounded-xl bg-black/30 border border-white/[0.05]">
            {SLIDE_COUNTS.map(n => {
              const active = carouselSlideCount === n;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => onUpdateCarouselSlideCount(n)}
                  disabled={isGeneratingCarousel}
                  className={`relative flex-1 py-1.5 rounded-lg text-[12px] font-bold transition-colors disabled:opacity-50 cursor-pointer ${
                    active ? 'text-white' : 'text-white/35 hover:text-white/70'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="slidecount-pill"
                      transition={spring}
                      className="absolute inset-0 rounded-lg bg-accent-purple/20 border border-accent-purple/40"
                    />
                  )}
                  <span className="relative z-10">{n}</span>
                </button>
              );
            })}
          </div>
          <span className="text-[10px] text-white/30 px-0.5">
            {carouselSlideCount <= 5 ? 'Carrossel curto e direto ao ponto.' : carouselSlideCount <= 10 ? 'Equilíbrio entre profundidade e retenção.' : 'Carrossel longo — ideal para tutoriais e conteúdo rico.'}
          </span>
        </div>

        {/* ─────────────── Marca d'água ─────────────── */}
        <div className="space-y-2">
          <FieldLabel>Marca d&apos;água</FieldLabel>
          <div className="flex gap-1 p-1 rounded-xl bg-black/30 border border-white/[0.05]">
            {WATERMARK_OPTIONS.map(opt => {
              const active = watermarkType === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onUpdateWatermarkType(opt.id)}
                  disabled={isGeneratingCarousel}
                  className={`relative flex-1 py-1.5 rounded-lg text-[10.5px] font-semibold transition-colors disabled:opacity-50 cursor-pointer ${
                    active ? 'text-white' : 'text-white/35 hover:text-white/70'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="watermark-pill"
                      transition={spring}
                      className="absolute inset-0 rounded-lg bg-white/[0.07] border border-white/[0.12]"
                    />
                  )}
                  <span className="relative z-10">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ─────────────── 3.7 — CTA Gerar carrossel ─────────────── */}
        <div className="space-y-2 pt-1">
          <motion.button
            onClick={onGenerateCarousel}
            disabled={!canGenerate}
            whileHover={canGenerate ? { scale: 1.015 } : undefined}
            whileTap={canGenerate ? { scale: 0.98 } : undefined}
            transition={spring}
            className={`relative w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[13px] font-bold text-white overflow-hidden transition-all ${
              canGenerate
                ? 'bg-gradient-to-r from-accent-purple to-accent-cyan shadow-[0_6px_24px_rgba(139,92,246,0.35)] hover:shadow-[0_8px_32px_rgba(139,92,246,0.55)] cursor-pointer'
                : isGeneratingCarousel
                  ? 'bg-gradient-to-r from-accent-purple to-accent-cyan shadow-[0_0_28px_rgba(139,92,246,0.5)] cursor-wait'
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
              ) : (
                <><Wand2 className="h-4 w-4" /> Gerar carrossel</>
              )}
            </span>
          </motion.button>

          {/* Contextual helper below CTA */}
          {!isGeneratingCarousel && (
            <p className="text-[10px] text-center text-white/30">
              {canGenerate
                ? <>Gera {carouselSlideCount} slides · ~30–90s · consome 1 geração</>
                : 'Descreva o tema acima para liberar a geração'}
            </p>
          )}
        </div>

      </div>
    </div>
  );
};
