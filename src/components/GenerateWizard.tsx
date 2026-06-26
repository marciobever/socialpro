"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  Wand2, Loader2, Check, Sparkles, Palette, Sliders, ImagePlus, X, ArrowLeft, ArrowRight, Lightbulb,
} from 'lucide-react';
import { Modal } from '@/components/Modal';
import { toast } from '@/components/Toast';
import { useAppContext } from '@/context/AppContext';
import type { CarouselStyleModel, ToneType, WatermarkType } from '@/types';

const spring = { type: 'spring' as const, stiffness: 400, damping: 28 };
const ease = [0.16, 1, 0.3, 1] as const;

const PHOTO_STYLES: { id: CarouselStyleModel; name: string; swatch: string }[] = [
  { id: 'lifestyle',  name: 'Lifestyle', swatch: 'linear-gradient(135deg,#d97706,#1c1713)' },
  { id: 'tech',       name: 'Cyber',     swatch: 'linear-gradient(135deg,#8b5cf6,#06b6d4)' },
  { id: 'alert',      name: 'Alerta',    swatch: 'linear-gradient(135deg,#7f1d1d,#f59e0b)' },
  { id: 'minimalist', name: 'Minimal',   swatch: 'linear-gradient(135deg,#0b0c10,#374151)' },
  { id: 'feminino',   name: 'Feminino',  swatch: 'linear-gradient(135deg,#f43f5e,#ec4899,#f9a8d4)' },
  { id: 'neutro',     name: 'Neutro',    swatch: 'linear-gradient(135deg,#d4b896,#f5f0e8,#c9a87a)' },
  { id: 'retro',      name: 'Retrô',     swatch: 'linear-gradient(135deg,#92400e,#b45309,#fbbf24)' },
  { id: 'aquarela',   name: 'Aquarela',  swatch: 'linear-gradient(135deg,#7dd3fc,#86efac,#fde68a)' },
  { id: 'neon',       name: 'Neon',      swatch: 'linear-gradient(135deg,#ec4899,#8b5cf6,#00f5ff)' },
];

const AVATAR_STYLES: { id: CarouselStyleModel; name: string; swatch: string }[] = [
  { id: 'infantil', name: 'Infantil', swatch: 'linear-gradient(135deg,#fb923c,#facc15,#4ade80)' },
  { id: 'pixar',    name: '3D Pixar', swatch: 'linear-gradient(135deg,#60a5fa,#a78bfa,#f472b6)' },
  { id: 'anime',    name: 'Anime',    swatch: 'linear-gradient(135deg,#f472b6,#fb923c,#facc15)' },
  { id: 'flat',     name: 'Flat Art', swatch: 'linear-gradient(135deg,#10b981,#3b82f6,#8b5cf6)' },
  { id: 'cartoon',  name: 'Cartoon',  swatch: 'linear-gradient(135deg,#ef4444,#f97316,#facc15)' },
];

const STYLE_DESC: Record<string, string> = {
  lifestyle: 'Fotografia real, tom quente e aspiracional',
  tech: 'Futurista, neon e grid cibernético',
  alert: 'Urgência e impacto, vermelho/âmbar',
  minimalist: 'Limpo, escuro e elegante',
  feminino: 'Suave, rosado e delicado',
  neutro: 'Bege sóbrio e atemporal',
  retro: 'Vintage âmbar, vibe anos 80',
  aquarela: 'Pintura suave em tons pastel',
  neon: 'Brilho vibrante e estética cibernética neon',
  infantil: 'Avatar ilustrado e lúdico',
  pixar: 'Avatar 3D estilo animação',
  anime: 'Avatar estilo mangá/anime',
  flat: 'Avatar flat art geométrico',
  cartoon: 'Avatar cartoon expressivo',
};

const TONES: { id: ToneType; label: string; emoji: string; desc: string }[] = [
  { id: 'provocativo', label: 'Provocativo', emoji: '🌶️', desc: 'Quebra padrões e gera reação' },
  { id: 'autoridade',  label: 'Autoridade',  emoji: '👔', desc: 'Dados e credibilidade' },
  { id: 'storyteller', label: 'Storyteller', emoji: '📖', desc: 'Narrativa e conexão emocional' },
  { id: 'meme',        label: 'Meme',        emoji: '⚡', desc: 'Humor e identificação' },
];

const SLIDE_COUNTS = [3, 5, 8, 10, 12, 16];

const WATERMARK_OPTIONS = [
  { id: 'both' as WatermarkType,   labelKey: 'watermark_both' },
  { id: 'handle' as WatermarkType, labelKey: 'watermark_handle' },
  { id: 'none' as WatermarkType,   labelKey: 'watermark_none' },
];

const STEP_META = [
  { title: 'Estilo visual',       desc: 'Como as imagens dos slides vão parecer.', icon: <Palette className="h-5 w-5" /> },
  { title: 'Ajustes',             desc: 'Tom de voz, tamanho e marca d’água.', icon: <Sliders className="h-5 w-5" /> },
  { title: 'Revisar e gerar',     desc: 'Confira tudo antes de criar o carrossel.', icon: <Sparkles className="h-5 w-5" /> },
];

function StyleChip({ name, swatch, active, onClick, title }: {
  name: string; swatch: string; active: boolean; onClick: () => void; title?: string;
}) {
  return (
    <motion.button
      type="button" onClick={onClick} title={title} whileTap={{ scale: 0.95 }} transition={spring}
      className={`group relative flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-[11px] font-semibold border transition-all cursor-pointer ${
        active
          ? 'border-accent-purple/60 bg-accent-purple/[0.14] text-white shadow-[0_0_0_1px_rgba(139,92,246,0.3)]'
          : 'border-white/[0.07] bg-white/[0.03] text-white/45 hover:text-white/85 hover:border-white/[0.16]'
      }`}
    >
      <span className={`w-3 h-3 rounded-md flex-shrink-0 ${active ? 'ring-1 ring-white/40' : ''}`} style={{ background: swatch }} />
      <span className="truncate">{name}</span>
    </motion.button>
  );
}

/**
 * Stepped carousel-generation wizard (modal). The topic + channel are picked on
 * the base creation screen; this wizard handles style → tweaks → review → generate.
 * All values live in AppContext, so this is purely a focused UI over shared state.
 */
export function GenerateWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTranslations('dashboard');
  const {
    carouselTopic,
    styleModel, setStyleModel,
    tone, setTone,
    carouselSlideCount, setCarouselSlideCount,
    watermarkType, setWatermarkType,
    referenceImage, setReferenceImage,
    handleGenerateCarousel,
  } = useAppContext();

  const [step, setStep] = React.useState(0);
  const fileRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => { if (open) setStep(0); }, [open]);

  React.useEffect(() => {
    if (!['infantil', 'pixar', 'anime', 'flat', 'cartoon'].includes(styleModel) && referenceImage) {
      setReferenceImage(null);
    }
  }, [styleModel, referenceImage, setReferenceImage]);

  const totalSteps = STEP_META.length;
  const isLast = step === totalSteps - 1;
  const meta = STEP_META[step];
  const activeTone = TONES.find(t => t.id === tone) ?? TONES[0];

  const readFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Arquivo inválido', 'Envie uma imagem PNG, JPG ou WebP.'); return; }
    const reader = new FileReader();
    reader.onload = () => { setReferenceImage(reader.result as string); toast.success('Imagem enviada', 'Será usada como referência visual'); };
    reader.readAsDataURL(file);
  };

  const handleGenerate = () => {
    onClose();
    handleGenerateCarousel();
  };

  // 4 visual dots: step 1 (tema) is already done on the base screen.
  const dotState = (i: number) => (i === 0 ? 'done' : i - 1 < step ? 'done' : i - 1 === step ? 'active' : 'todo');

  return (
    <Modal open={open} onClose={onClose} size="lg" icon={meta.icon} title={meta.title} description={meta.desc}>
      <div className="space-y-5">
        {/* Progress dots — 4 total (tema + 3 wizard steps) */}
        <div className="flex items-center gap-2">
          {[0, 1, 2, 3].map(i => {
            const s = dotState(i);
            return (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${
                s === 'active' ? 'w-8 bg-accent-purple' : s === 'done' ? 'w-2 bg-accent-purple/60' : 'w-2 bg-white/15'
              }`} />
            );
          })}
          <span className="ml-auto text-[10px] font-bold text-white/35 tabular-nums">Passo {step + 2} de {totalSteps + 1}</span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2, ease }}
            className="min-h-[260px]"
          >
            {/* ── Step 0: Estilo visual ── */}
            {step === 0 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Fotografia</p>
                  <div className="grid grid-cols-4 gap-2">
                    {PHOTO_STYLES.map(s => (
                      <StyleChip key={s.id} name={s.name} swatch={s.swatch} title={STYLE_DESC[s.id]}
                        active={styleModel === s.id} onClick={() => setStyleModel(s.id)} />
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Avatar / Ilustração</p>
                  <div className="grid grid-cols-4 gap-2">
                    {AVATAR_STYLES.map(s => (
                      <StyleChip key={s.id} name={s.name} swatch={s.swatch} title={STYLE_DESC[s.id]}
                        active={styleModel === s.id} onClick={() => setStyleModel(s.id)} />
                    ))}
                  </div>
                </div>
                <div className="flex items-start gap-2 px-3 py-2 rounded-xl bg-accent-purple/[0.05] border border-accent-purple/[0.12]">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent-purple flex-shrink-0 mt-1.5" />
                  <p className="text-[11px] text-white/55 leading-relaxed">{STYLE_DESC[styleModel] ?? 'Define o visual de todos os slides.'}</p>
                </div>

                {/* Reference image (optional) */}
                {['infantil', 'pixar', 'anime', 'flat', 'cartoon'].includes(styleModel) && (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[11px] font-bold text-white/70"><ImagePlus className="h-3.5 w-3.5 text-white/40" />Imagem de referência</span>
                      <span className="text-[10px] text-white/30">opcional</span>
                    </div>
                    <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden"
                      onChange={e => { readFile(e.target.files?.[0]); e.target.value = ''; }} />
                    {referenceImage ? (
                      <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-accent-purple/[0.06] border border-accent-purple/30">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={referenceImage} alt="Referência" className="h-10 w-10 rounded-xl object-cover border border-white/10 flex-shrink-0" />
                        <p className="flex-1 text-[11px] font-bold text-accent-cyan flex items-center gap-1"><Check className="h-3 w-3" />Referência ativa</p>
                        <button type="button" onClick={() => setReferenceImage(null)}
                          className="text-[9px] font-bold px-2 py-1 rounded-lg border border-white/[0.08] text-white/40 hover:text-rose-400 hover:border-rose-500/30 transition-all cursor-pointer flex items-center gap-1">
                          <X className="h-2.5 w-2.5" />Remover
                        </button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => fileRef.current?.click()}
                        className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/[0.10] bg-white/[0.015] px-3 py-3 text-white/45 hover:border-accent-purple/40 hover:text-white/70 transition-all cursor-pointer">
                        <ImagePlus className="h-4 w-4" />
                        <span className="text-[11px] font-semibold">Enviar imagem de referência</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── Step 1: Ajustes (tom + slides + marca) ── */}
            {step === 1 && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-white/70"><Sparkles className="h-3.5 w-3.5 text-accent-purple" />Tom de voz</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {TONES.map(tn => {
                      const active = tone === tn.id;
                      return (
                        <motion.button key={tn.id} type="button" onClick={() => setTone(tn.id)} whileTap={{ scale: 0.96 }} transition={spring}
                          className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-[11px] font-semibold border transition-all cursor-pointer ${
                            active ? 'border-accent-purple/60 bg-accent-purple/[0.14] text-white shadow-[0_0_0_1px_rgba(139,92,246,0.3)]'
                                   : 'border-white/[0.07] bg-white/[0.03] text-white/45 hover:text-white/85 hover:border-white/[0.16]'
                          }`}>
                          <span className="text-[13px] leading-none">{tn.emoji}</span>{tn.label}
                        </motion.button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-white/40 px-0.5">{activeTone.emoji} <span className="font-semibold text-white/55">{activeTone.label}:</span> {activeTone.desc}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-white/70">Quantidade de slides</span>
                    <span className="text-[10px] text-white/30">{carouselSlideCount} slides</span>
                  </div>
                  <div className="flex gap-1 p-1 rounded-xl bg-black/30 border border-white/[0.05]">
                    {SLIDE_COUNTS.map(n => {
                      const active = carouselSlideCount === n;
                      return (
                        <button key={n} type="button" onClick={() => setCarouselSlideCount(n)}
                          className={`relative flex-1 py-1.5 rounded-lg text-[12px] font-bold transition-colors cursor-pointer ${active ? 'text-white' : 'text-white/35 hover:text-white/70'}`}>
                          {active && <motion.span layoutId="wiz-slidecount" transition={spring} className="absolute inset-0 rounded-lg bg-accent-purple/20 border border-accent-purple/40" />}
                          <span className="relative z-10">{n}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-white/70">Marca d&apos;água</span>
                  <div className="flex gap-1 p-1 rounded-xl bg-black/30 border border-white/[0.05]">
                    {WATERMARK_OPTIONS.map(opt => {
                      const active = watermarkType === opt.id;
                      return (
                        <button key={opt.id} type="button" onClick={() => setWatermarkType(opt.id)}
                          className={`relative flex-1 py-1.5 rounded-lg text-[10.5px] font-semibold transition-colors cursor-pointer ${active ? 'text-white' : 'text-white/35 hover:text-white/70'}`}>
                          {active && <motion.span layoutId="wiz-watermark" transition={spring} className="absolute inset-0 rounded-lg bg-white/[0.07] border border-white/[0.12]" />}
                          <span className="relative z-10">{t(opt.labelKey)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 2: Revisar ── */}
            {step === 2 && (
              <div className="space-y-3">
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 space-y-3">
                  <ReviewRow label="Tema" value={carouselTopic || '—'} />
                  <ReviewRow label="Estilo" value={(PHOTO_STYLES.concat(AVATAR_STYLES).find(s => s.id === styleModel)?.name) ?? styleModel} />
                  <ReviewRow label="Tom de voz" value={`${activeTone.emoji} ${activeTone.label}`} />
                  <ReviewRow label="Slides" value={`${carouselSlideCount}`} />
                  <ReviewRow label="Marca d'água" value={t(WATERMARK_OPTIONS.find(w => w.id === watermarkType)?.labelKey ?? 'watermark_none')} />
                  <ReviewRow label="Referência" value={referenceImage ? 'Imagem anexada' : 'Nenhuma'} />
                </div>
                <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-accent-cyan/[0.05] border border-accent-cyan/15">
                  <Lightbulb className="h-3.5 w-3.5 text-accent-cyan flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-white/55 leading-relaxed">Gera {carouselSlideCount} slides em ~30–90s e consome 1 geração do seu plano. Você poderá editar tudo depois.</p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* ── Nav ── */}
        <div className="flex items-center gap-2.5 pt-1">
          <button
            onClick={() => (step === 0 ? onClose() : setStep(s => s - 1))}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold border border-white/[0.10] text-white/60 hover:text-white hover:border-white/[0.2] transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />{step === 0 ? 'Voltar' : 'Anterior'}
          </button>
          {isLast ? (
            <motion.button onClick={handleGenerate} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} transition={spring}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold text-white bg-gradient-to-r from-accent-purple to-accent-cyan shadow-[0_4px_16px_rgba(139,92,246,0.3)] hover:shadow-[0_6px_24px_rgba(139,92,246,0.5)] transition-shadow cursor-pointer">
              <Wand2 className="h-4 w-4" />Gerar carrossel
            </motion.button>
          ) : (
            <motion.button onClick={() => setStep(s => s + 1)} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} transition={spring}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold text-white bg-gradient-to-r from-accent-purple to-accent-cyan shadow-[0_4px_16px_rgba(139,92,246,0.3)] hover:shadow-[0_6px_24px_rgba(139,92,246,0.5)] transition-shadow cursor-pointer">
              Próximo<ArrowRight className="h-4 w-4" />
            </motion.button>
          )}
        </div>
      </div>
    </Modal>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[11px] text-white/40 flex-shrink-0">{label}</span>
      <span className="text-[12px] font-semibold text-white/85 truncate text-right">{value}</span>
    </div>
  );
}
