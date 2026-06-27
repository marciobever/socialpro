"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useAppContext } from '@/context/AppContext';
import { Instagram, Twitter, Linkedin } from '@/components/icons';
import {
  ChevronLeft, Sparkles, Plus, Loader2, Wand2, ImageIcon, X, ArrowRight
} from 'lucide-react';
import { toast } from '@/components/Toast';
import type { CarouselStyleModel, ToneType, WatermarkType } from '@/types';

const ease = [0.16, 1, 0.3, 1] as const;
const spring = { type: 'spring' as const, stiffness: 400, damping: 28 };

const FORMATS = [
  { id: 'instagram' as const, label: 'Instagram',  icon: Instagram, color: 'text-pink-400'  },
  { id: 'x' as const,         label: 'X / Twitter', icon: Twitter,   color: 'text-sky-400'   },
  { id: 'linkedin' as const,  label: 'LinkedIn',    icon: Linkedin,  color: 'text-blue-400'  },
];

const WIZARD_TONES = [
  { id: 'provocativo' as ToneType, labelKey: 'provocativo', emoji: '🌶️', descKey: 'provocativo_desc' },
  { id: 'autoridade' as ToneType, labelKey: 'autoridade',  emoji: '👔', descKey: 'autoridade_desc' },
  { id: 'storyteller' as ToneType, labelKey: 'storyteller', emoji: '📖', descKey: 'storyteller_desc' },
  { id: 'meme' as ToneType, labelKey: 'meme',        emoji: '⚡', descKey: 'meme_desc' },
];

const WIZARD_SLIDE_COUNTS = [3, 5, 8, 10, 12, 16];

const WIZARD_WATERMARK_OPTIONS = [
  { id: 'both' as WatermarkType,   labelKey: 'watermark_both' },
  { id: 'handle' as WatermarkType, labelKey: 'watermark_handle' },
  { id: 'none' as WatermarkType,   labelKey: 'watermark_none' },
];

const PRIMARY_STYLES = [
  { id: 'lifestyle' as CarouselStyleModel,  swatch: 'linear-gradient(135deg,#d97706,#1c1713)' },
  { id: 'tech' as CarouselStyleModel,       swatch: 'linear-gradient(135deg,#8b5cf6,#06b6d4)' },
  { id: 'alert' as CarouselStyleModel,      swatch: 'linear-gradient(135deg,#7f1d1d,#f59e0b)' },
  { id: 'minimalist' as CarouselStyleModel, swatch: 'linear-gradient(135deg,#0b0c10,#374151)' },
  { id: 'feminino' as CarouselStyleModel,   swatch: 'linear-gradient(135deg,#f43f5e,#ec4899,#f9a8d4)' },
  { id: 'neutro' as CarouselStyleModel,     swatch: 'linear-gradient(135deg,#d4b896,#f5f0e8,#c9a87a)' },
  { id: 'retro' as CarouselStyleModel,      swatch: 'linear-gradient(135deg,#92400e,#b45309,#fbbf24)' },
  { id: 'aquarela' as CarouselStyleModel,   swatch: 'linear-gradient(135deg,#7dd3fc,#86efac,#fde68a)' },
  { id: 'neon' as CarouselStyleModel,       swatch: 'linear-gradient(135deg,#ec4899,#8b5cf6,#00f5ff)' },
  { id: 'infantil' as CarouselStyleModel,   swatch: 'linear-gradient(135deg,#fb923c,#facc15,#4ade80)' },
];

const AVATAR_STYLES_SUB: { id: CarouselStyleModel; swatch: string }[] = [
  { id: 'infantil', swatch: 'linear-gradient(135deg,#fb923c,#facc15,#4ade80)' },
  { id: 'pixar',    swatch: 'linear-gradient(135deg,#60a5fa,#a78bfa,#f472b6)' },
  { id: 'anime',    swatch: 'linear-gradient(135deg,#f472b6,#fb923c,#facc15)' },
  { id: 'flat',     swatch: 'linear-gradient(135deg,#10b981,#3b82f6,#8b5cf6)' },
  { id: 'cartoon',  swatch: 'linear-gradient(135deg,#ef4444,#f97316,#facc15)' },
];

const INSTAGRAM_SUGGESTIONS = [
  "5 erros de liderança que custam caro",
  "Como usei IA para dobrar minha produtividade",
  "O checklist perfeito para um post de alta conversão",
  "Por que seu conteúdo não vende (e como corrigir)"
];

const X_SUGGESTIONS = [
  "A verdade nua e crua sobre trabalhar remoto",
  "3 lições de negócios que aprendi quebrando minha startup",
  "Por que o e-mail marketing ainda funciona",
  "Como escrever ganchos que prendem a atenção"
];

const LINKEDIN_SUGGESTIONS = [
  "Como a inteligência artificial está mudando a liderança",
  "O guia prático para fazer networking de verdade",
  "3 hábitos diários que me ajudaram a crescer profissionalmente",
  "Os maiores erros de contratação que startups cometem"
];

export function CreationFlow() {
  const t = useTranslations('dashboard');
  const tStyles = useTranslations('styles');
  const tTones = useTranslations('tones');

  const {
    platform, setPlatform,
    xPostFormat, setXPostFormat,
    tone, setTone,
    styleModel, setStyleModel,
    watermarkType, setWatermarkType,
    carouselTopic, setCarouselTopic,
    carouselSlideCount, setCarouselSlideCount,
    referenceImage, setReferenceImage,
    isGeneratingCarousel, isGenerating,
    handleGenerateCarousel, handleGenerateTextPost,
    brandKit,
  } = useAppContext();

  const [creationStep, setCreationStep] = React.useState<'platform' | 'create'>('platform');
  const fileRef = React.useRef<HTMLInputElement>(null);

  const isCarousel = platform === 'instagram' || platform === 'linkedin' || (platform === 'x' && xPostFormat === 'image');
  const isAvatarStyle = ['infantil', 'pixar', 'anime', 'flat', 'cartoon'].includes(styleModel);

  const cleanName = brandKit.brandName || 'SocialPro';
  const cleanHandle = brandKit.brandHandle
    ? (brandKit.brandHandle.startsWith('@') ? brandKit.brandHandle : `@${brandKit.brandHandle}`)
    : '@social';

  const handleGenerate = () => {
    if (isCarousel) handleGenerateCarousel();
    else handleGenerateTextPost();
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 w-full relative">
      {creationStep === 'platform' ? (
        <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full px-4 py-8 md:py-12 min-h-0 lg:overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease }}
            className="space-y-8 w-full text-center"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-accent-purple/25 bg-accent-purple/[0.07] text-[10px] font-bold uppercase tracking-[0.16em] text-accent-purple">
                  <Sparkles className="h-3 w-3" /> {t('studioTitle')}
                </span>
                <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border bg-white/[0.04] border-white/[0.08] text-white/40">
                  {t('step1of3')}
                </span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-extrabold text-white tracking-tight">{t('whereToPublish')}</h2>
              <p className="text-sm text-white/45 max-w-md mx-auto leading-relaxed">
                {t('selectPlatformDesc')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto pt-4">
              {FORMATS.map(f => {
                const Icon = f.icon;
                return (
                  <motion.button
                    key={f.id}
                    onClick={() => {
                      setPlatform(f.id);
                      if (f.id === 'x') {
                        setXPostFormat('text');
                      }
                      setCreationStep('create');
                    }}
                    whileHover={{ scale: 1.025, translateY: -4 }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative flex flex-col items-center justify-between p-6 rounded-3xl border border-white/[0.08] hover:border-accent-purple/50 bg-[#181b25]/40 hover:bg-[#181b25]/75 transition-all text-center cursor-pointer min-h-[190px] overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-tr from-accent-purple/5 to-accent-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    
                    <div className="h-12 w-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] group-hover:border-accent-purple/30 group-hover:bg-accent-purple/10 flex items-center justify-center transition-colors">
                      <Icon className={`h-6 w-6 ${f.color} group-hover:scale-110 transition-transform`} />
                    </div>

                    <div className="space-y-1 z-10">
                      <h3 className="text-sm font-bold text-white group-hover:text-accent-purple transition-colors">{f.label}</h3>
                      <p className="text-[10px] text-white/40 leading-normal">
                        {f.id === 'instagram' ? t('instagramFormatDesc') : f.id === 'x' ? t('xFormatDesc') : t('linkedinFormatDesc')}
                      </p>
                    </div>

                    <div className="text-[10px] font-bold text-accent-cyan opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-2 z-10">
                      {t('startLink')} <ArrowRight className="h-3 w-3" />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full px-4 py-8 md:py-12 min-h-0 lg:overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
          {/* Back button */}
          <div className="flex items-center justify-between mb-4 flex-shrink-0 w-full">
            <button
              onClick={() => setCreationStep('platform')}
              className="flex items-center gap-1.5 text-xs font-semibold text-white/45 hover:text-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" /> {t('backButton')}
            </button>
            <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border bg-white/[0.04] border-white/[0.08] text-white/40">
              {t('step2of3')}
            </span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease }}
            className="space-y-6 flex-1 flex flex-col justify-center min-h-0 w-full"
          >
            {/* Header */}
            <div className="space-y-1 text-center flex-shrink-0">
              <h2 className="font-display text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                {isCarousel ? t('createTodayInstagram') : platform === 'x' ? t('postTodayX') : t('publishTodayLinkedIn')}
              </h2>
              <p className="text-xs text-white/45 leading-relaxed">
                {t('themePromptSubtitle')}
              </p>
            </div>

            {/* Input Box (Gemini-like) */}
            <div className="space-y-3 flex-shrink-0 w-full">
              <div className="relative rounded-3xl border border-white/[0.08] bg-[#181b25]/40 hover:bg-[#181b25]/50 focus-within:bg-[#181b25]/75 focus-within:border-accent-purple/50 focus-within:shadow-[0_0_24px_rgba(139,92,246,0.12)] transition-all pt-6 px-6 pb-5 flex flex-col gap-3 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-accent-purple/[0.02] to-accent-cyan/[0.02] pointer-events-none" />
                <textarea
                  value={carouselTopic}
                  onChange={e => setCarouselTopic(e.target.value)}
                  placeholder={isCarousel 
                    ? t('placeholderInstagramTopic')
                    : t('placeholderOtherTopic')}
                  className="relative z-10 w-full min-h-[90px] bg-transparent outline-none resize-none text-[13px] text-white placeholder:text-white/20 font-normal leading-relaxed pt-2 px-1"
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey && carouselTopic.trim()) {
                      e.preventDefault();
                      handleGenerate();
                    }
                  }}
                />

                {/* Action Row Inside Textbox */}
                <div className="flex items-center justify-between pt-2 border-t border-white/[0.04] relative z-10">
                  <div className="flex items-center gap-2">
                    {isCarousel && isAvatarStyle && (
                      <>
                        <input
                          ref={fileRef}
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="hidden"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (!file.type.startsWith('image/')) {
                                toast.error(t('imageUploadInvalidFile'), t('imageUploadInvalidFileDesc'));
                                return;
                              }
                              const reader = new FileReader();
                              reader.onload = () => {
                                setReferenceImage(reader.result as string);
                                toast.success(t('imageUploadSuccess'), t('imageUploadSuccessDesc'));
                              };
                              reader.readAsDataURL(file);
                            }
                            e.target.value = '';
                          }}
                        />
                        
                        {referenceImage ? (
                          <div className="flex items-center gap-2 p-1.5 rounded-xl bg-accent-purple/[0.08] border border-accent-purple/30">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={referenceImage} alt="Referência" className="h-6 w-6 rounded-md object-cover border border-white/10" />
                            <span className="text-[10px] font-bold text-accent-cyan">{t('activeRefLabel')}</span>
                            <button
                              type="button"
                              onClick={() => setReferenceImage(null)}
                              className="text-white/40 hover:text-rose-400 p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => fileRef.current?.click()}
                            title={t('imageReferenceTitle')}
                            className="p-2 px-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/[0.15] text-white/55 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-[10.5px] font-semibold"
                          >
                            <ImageIcon className="h-3.5 w-3.5 text-accent-purple" />
                            <span>{t('imageReferenceLabel')}</span>
                          </button>
                        )}
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-white/25 tabular-nums">{t('characterCounter', { count: carouselTopic.length })}</span>
                  </div>
                </div>
              </div>

              {/* Suggestion Chips */}
              <div className="flex flex-wrap gap-2 justify-center pt-1">
                {(platform === 'instagram' ? INSTAGRAM_SUGGESTIONS : platform === 'x' ? X_SUGGESTIONS : LINKEDIN_SUGGESTIONS).map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCarouselTopic(s)}
                    className="px-3 py-1.5 rounded-xl border border-white/[0.06] bg-[#181b25]/30 text-white/45 hover:text-white hover:border-accent-purple/45 hover:bg-accent-purple/[0.04] transition-all text-[10px] font-bold cursor-pointer"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Configuration Options (Unified Panel) */}
            <div className="space-y-4 pt-1 flex-shrink-0 w-full">
              <div className="rounded-3xl border border-white/[0.08] bg-[#181b25]/40 p-6 space-y-6 relative overflow-hidden w-full text-left">
                <div className="absolute inset-0 bg-gradient-to-tr from-accent-purple/[0.01] to-accent-cyan/[0.01] pointer-events-none" />
 
                {/* Format selection for X / Twitter */}
                {platform === 'x' && (
                  <div className="space-y-3 relative z-10 pb-4 border-b border-white/[0.05]">
                    <span className="text-[10px] font-bold text-white/45 uppercase tracking-[0.14em] block px-0.5">Formato do Post</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setXPostFormat('text');
                          setCarouselSlideCount(5); // Reset slide count if switched to text (though unused)
                        }}
                        className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          xPostFormat === 'text'
                            ? 'border-accent-purple/60 bg-accent-purple/[0.14] text-white shadow-[0_0_0_1px_rgba(139,92,246,0.3),0_0_14px_rgba(139,92,246,0.18)]'
                            : 'border-white/[0.07] bg-white/[0.03] text-white/45 hover:text-white/85 hover:border-white/[0.16] hover:bg-white/[0.05]'
                        }`}
                      >
                        ✍️ Apenas Texto
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setXPostFormat('image');
                          setCarouselSlideCount(1); // X image post is exactly 1 slide!
                        }}
                        className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          xPostFormat === 'image'
                            ? 'border-accent-purple/60 bg-accent-purple/[0.14] text-white shadow-[0_0_0_1px_rgba(139,92,246,0.3),0_0_14px_rgba(139,92,246,0.18)] font-bold'
                            : 'border-white/[0.07] bg-white/[0.03] text-white/45 hover:text-white/85 hover:border-white/[0.16] hover:bg-white/[0.05]'
                        }`}
                      >
                        🖼️ Imagem + Texto
                      </button>
                    </div>
                  </div>
                )}

                {/* Visual Style Selector (only for Instagram) */}
                {isCarousel && (
                  <div className="space-y-3 relative z-10">
                    <span className="text-[10px] font-bold text-white/45 uppercase tracking-[0.14em] block px-0.5">{t('carouselVisualStyleLabel')}</span>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {PRIMARY_STYLES.map(s => {
                        const active = styleModel === s.id || (s.id === 'infantil' && isAvatarStyle);
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => {
                              if (s.id === 'infantil') {
                                if (!isAvatarStyle) {
                                  setStyleModel('infantil');
                                }
                              } else {
                                setStyleModel(s.id);
                              }
                            }}
                            title={tStyles(`${s.id}_desc` as any)}
                            className={`flex items-center gap-1.5 px-2.5 py-2.5 rounded-xl border text-[10.5px] font-bold transition-all cursor-pointer ${
                              active
                                ? 'border-accent-purple/60 bg-accent-purple/[0.14] text-white shadow-[0_0_0_1px_rgba(139,92,246,0.3),0_0_14px_rgba(139,92,246,0.18)]'
                                : 'border-white/[0.07] bg-white/[0.03] text-white/45 hover:text-white/85 hover:border-white/[0.16] hover:bg-white/[0.05]'
                            }`}
                          >
                            <span className="w-3.5 h-3.5 rounded-md flex-shrink-0" style={{ background: s.swatch }} />
                            <span className="truncate">{tStyles(s.id as any)}</span>
                          </button>
                        );
                      })}
                    </div>

                    <AnimatePresence>
                      {isAvatarStyle && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.22, ease }}
                          className="overflow-hidden"
                        >
                          <div className="pt-3 border-t border-white/[0.05] mt-2">
                            <span className="text-[10px] font-bold text-accent-cyan/85 uppercase tracking-[0.14em] block px-0.5 mb-2">
                              {t('drawingStyleLabel')}
                            </span>
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                              {AVATAR_STYLES_SUB.map(s => {
                                const active = styleModel === s.id;
                                return (
                                  <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => setStyleModel(s.id)}
                                    title={tStyles(`${s.id}_desc` as any)}
                                    className={`flex items-center gap-1.5 px-2.5 py-2.5 rounded-xl border text-[10px] font-bold transition-all cursor-pointer ${
                                      active
                                        ? 'border-accent-cyan/50 bg-accent-cyan/[0.08] text-white shadow-[0_0_0_1px_rgba(6,182,212,0.25),0_0_10px_rgba(6,182,212,0.12)]'
                                        : 'border-white/[0.07] bg-white/[0.02] text-white/40 hover:text-white/80 hover:border-white/[0.12] hover:bg-white/[0.04]'
                                    }`}
                                  >
                                    <span className="w-3.5 h-3.5 rounded-md flex-shrink-0" style={{ background: s.swatch }} />
                                    <span className="truncate">{tStyles(s.id as any)}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Adjustments Panel: Tone, Slides, Watermark */}
                <div className={`grid gap-6 relative z-10 ${isCarousel ? (platform === 'x' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-3') : 'grid-cols-1'}`}>
                  {/* Tone Selection */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-white/45 uppercase tracking-[0.14em] block px-0.5">{t('toneOfVoiceLabel')}</span>
                    <div className="grid grid-cols-2 gap-2">
                      {WIZARD_TONES.map(tn => {
                        const active = tone === tn.id;
                        return (
                          <button
                            key={tn.id}
                            type="button"
                            onClick={() => setTone(tn.id)}
                            title={tTones(tn.descKey as any)}
                            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-[10px] font-bold transition-all cursor-pointer ${
                              active
                                ? 'border-accent-purple/60 bg-accent-purple/[0.14] text-white shadow-[0_0_0_1px_rgba(139,92,246,0.3),0_0_14px_rgba(139,92,246,0.18)]'
                                : 'border-white/[0.07] bg-white/[0.03] text-white/45 hover:text-white/85 hover:border-white/[0.16] hover:bg-white/[0.05]'
                            }`}
                          >
                            <span className="text-xs">{tn.emoji}</span>
                            <span>{tTones(tn.labelKey as any)}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Slides Count (Instagram only) */}
                  {isCarousel && platform !== 'x' && (
                    <div className="space-y-3">
                      <div>
                        <span className="text-[10px] font-bold text-white/45 uppercase tracking-[0.14em] block px-0.5">{t('carouselSizeLabel')}</span>
                        <p className="text-[9.5px] text-accent-cyan/95 font-semibold leading-snug px-0.5 mt-0.5">{t('generateImagesAiText', { count: carouselSlideCount })}</p>
                      </div>
                      <div className="flex gap-1 p-1 rounded-2xl bg-black/30 border border-white/[0.04]">
                        {WIZARD_SLIDE_COUNTS.map(n => {
                          const active = carouselSlideCount === n;
                          return (
                            <button
                              key={n}
                              type="button"
                              onClick={() => setCarouselSlideCount(n)}
                              className={`flex-1 py-1.5 rounded-xl text-[10.5px] font-bold transition-all cursor-pointer ${
                                active
                                  ? 'bg-white/[0.07] border border-white/[0.1] text-white shadow-[0_2px_8px_rgba(0,0,0,0.4)]'
                                  : 'text-white/30 hover:text-white/60 hover:bg-white/[0.02]'
                              }`}
                            >
                              {n}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Watermark Selector (Instagram only) */}
                  {isCarousel && (
                    <div className="space-y-3">
                      <div>
                        <span className="text-[10px] font-bold text-white/45 uppercase tracking-[0.14em] block px-0.5">{t('watermark')}</span>
                        <p className="text-[9px] text-white/30 leading-snug px-0.5 mt-0.5">{t('watermark_desc')}</p>
                      </div>
                      <div className="flex gap-1 p-1 rounded-2xl bg-black/30 border border-white/[0.04]">
                        {WIZARD_WATERMARK_OPTIONS.map(opt => {
                          const active = watermarkType === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setWatermarkType(opt.id)}
                              className={`flex-1 py-2 px-1 rounded-xl text-[9.5px] font-bold transition-all cursor-pointer flex flex-col items-center justify-center min-h-[44px] leading-tight ${
                                active
                                  ? 'bg-white/[0.07] border border-white/[0.1] text-white shadow-[0_2px_8px_rgba(0,0,0,0.4)]'
                                  : 'text-white/30 hover:text-white/60 hover:bg-white/[0.02]'
                              }`}
                            >
                              <span>{t(opt.labelKey)}</span>
                              {opt.id !== 'none' ? (
                                <span className="text-[7.5px] font-normal opacity-50 mt-0.5 truncate max-w-full block px-0.5">
                                  {opt.id === 'both' ? `${cleanName} ${cleanHandle}` : cleanHandle}
                                </span>
                              ) : (
                                <span className="text-[7.5px] font-normal opacity-50 mt-0.5 block">
                                  ({t('watermark_none_example')})
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Generate Button Container */}
            <div className="flex items-center justify-end pt-3 border-t border-white/[0.05] flex-shrink-0">
              <motion.button
                onClick={handleGenerate}
                disabled={!carouselTopic.trim() || isGeneratingCarousel || isGenerating}
                whileHover={carouselTopic.trim() ? { scale: 1.02 } : undefined}
                whileTap={carouselTopic.trim() ? { scale: 0.98 } : undefined}
                transition={spring}
                className="flex items-center gap-2 px-6 py-2.5 rounded-2xl text-[12.5px] font-bold text-white bg-gradient-to-r from-accent-purple to-accent-cyan disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_4px_16px_rgba(139,92,246,0.25)] hover:shadow-[0_6px_24px_rgba(139,92,246,0.45)] transition-all cursor-pointer"
              >
                {isGeneratingCarousel || isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t('generatingScript')}
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4" />
                    {t('generateContentAi')}
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
