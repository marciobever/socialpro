"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useAppContext } from '@/context/AppContext';
import {
  Copy, Check, Loader2, X, ImageIcon, Download, Plus, RefreshCw,
  ChevronLeft, ChevronRight, Trash2, Pencil, Sliders
} from 'lucide-react';
import { toast } from '@/components/Toast';
import type { Slide } from '@/types';

const ease = [0.16, 1, 0.3, 1] as const;
const spring = { type: 'spring' as const, stiffness: 400, damping: 28 };
const GRADIENTS = [
  'linear-gradient(135deg,#4f46e5,#7c3aed,#c084fc)',
  'linear-gradient(135deg,#0891b2,#06b6d4,#22d3ee)',
  'linear-gradient(135deg,#f97316,#ea580c,#f43f5e)',
  'linear-gradient(135deg,#a855f7,#ec4899,#f43f5e)',
  'linear-gradient(135deg,#059669,#10b981,#34d399)',
  'linear-gradient(135deg,#111827,#1f2937,#374151)',
  'linear-gradient(135deg,#7c3aed,#4f46e5,#0891b2)',
  'linear-gradient(135deg,#dc2626,#ea580c,#f59e0b)',
];

const SlideQuickAction = React.memo(function SlideQuickAction({ icon, title, onClick, danger }: {
  icon: React.ReactNode; title: string; onClick: () => void; danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={e => { e.stopPropagation(); onClick(); }}
      className={`h-6 w-6 rounded-lg flex items-center justify-center backdrop-blur-md border transition-colors cursor-pointer ${
        danger
          ? 'bg-black/50 border-white/15 text-white/70 hover:bg-rose-500/90 hover:text-white hover:border-rose-400'
          : 'bg-black/50 border-white/15 text-white/70 hover:bg-white/20 hover:text-white'
      }`}
    >
      {icon}
    </button>
  );
});

const SlideCard = React.memo(function SlideCard({
  slide, index, isActive, total, isOutdated,
  onSelect, onDelete, onRegenerate, onDuplicate, canDuplicate,
}: {
  slide: Slide; index: number; isActive: boolean; total: number; isOutdated: boolean;
  onSelect: (i: number) => void; onDelete: (i: number) => void; onRegenerate: (i: number) => void;
  onDuplicate: (i: number) => void; canDuplicate: boolean;
}) {
  const canRegen = !!(slide.imageUrl && slide.imagePrompt);
  return (
    <div className="relative group">
      <button
        onClick={() => onSelect(index)}
        className={`relative w-full aspect-[4/5] rounded-2xl overflow-hidden border transition-all duration-200 block cursor-pointer keep-dark ${
          isActive
            ? 'border-accent-purple shadow-[0_0_0_2px_rgba(139,92,246,0.25),0_10px_30px_rgba(139,92,246,0.18)] z-10'
            : 'border-white/[0.08] hover:border-accent-purple/45 hover:shadow-[0_6px_20px_rgba(0,0,0,0.5)]'
        }`}
      >
        {slide.imageUrl ? (
          <motion.img
            key={slide.imageUrl}
            initial={{ opacity: 0, scale: 1.06, filter: 'blur(12px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.6, ease }}
            src={slide.imageUrl}
            alt={slide.title}
            className="w-full h-full object-contain bg-black/60"
          />
        ) : slide.isGeneratingImage ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2" style={{ background: '#14161e' }}>
            <Loader2 className="h-5 w-5 text-accent-purple animate-spin" />
            <span className="text-[9px] text-white/40 font-semibold">Gerando...</span>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col justify-between p-3" style={{ background: slide.background }}>
            <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Slide {index + 1}</span>
            <div className="space-y-1">
              <p className="text-[11px] font-extrabold text-white leading-tight line-clamp-3" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.5)' }}>{slide.title || 'Título'}</p>
              <p className="text-[9px] text-white/75 leading-snug line-clamp-2">{slide.subtitle}</p>
            </div>
          </div>
        )}

        <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-black/45 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        <span className="absolute top-2 left-2 text-[9px] font-black text-white bg-black/60 backdrop-blur-sm rounded-md px-1.5 py-0.5 leading-tight tabular-nums">
          {index + 1}<span className="text-white/45">/{total}</span>
        </span>

        {isOutdated && (
          <span className="absolute bottom-2 left-2 flex items-center gap-1 text-[8px] font-bold text-amber-300 bg-black/55 backdrop-blur-sm rounded-md px-1.5 py-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]" /> editado
          </span>
        )}

        {isActive && !isOutdated && (
          <span className="absolute bottom-2 left-2 h-4 w-4 rounded-full bg-accent-purple flex items-center justify-center shadow-[0_0_10px_rgba(139,92,246,0.6)]">
            <Check className="h-2.5 w-2.5 text-white" />
          </span>
        )}

        {!slide.imageUrl && !slide.isGeneratingImage && (
          <div className="absolute bottom-2 right-2 p-1 rounded-md bg-black/40 border border-white/10">
            <ImageIcon className="h-3 w-3 text-white/40" />
          </div>
        )}
      </button>

      <div className="absolute top-2 right-2 z-20 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {canRegen && <SlideQuickAction icon={<RefreshCw className="h-3 w-3" />} title="Regerar imagem" onClick={() => onRegenerate(index)} />}
        {canDuplicate && <SlideQuickAction icon={<Copy className="h-3 w-3" />} title="Duplicar slide" onClick={() => onDuplicate(index)} />}
        {total > 1 && <SlideQuickAction icon={<X className="h-3 w-3" />} title="Excluir slide" onClick={() => onDelete(index)} danger />}
      </div>
    </div>
  );
});

interface CarouselWorkspaceProps {
  onOpenWizard: () => void;
  onOpenConfirmRedo: () => void;
  onOpenConfirmNewPost: () => void;
  onConfirmDeleteIndex: (index: number) => void;
}

export function CarouselWorkspace({
  onOpenWizard,
  onOpenConfirmRedo,
  onOpenConfirmNewPost,
  onConfirmDeleteIndex,
}: CarouselWorkspaceProps) {
  const t = useTranslations('dashboard');
  const {
    slides, setSlides,
    activeSlideIndex, setActiveSlideIndex,
    carouselSlideCount, setCarouselSlideCount,
    carouselTopic,
    isGeneratingCarousel,
    handleRegenerateSlideImage,
    handleRegenerateAllImages,
  } = useAppContext();

  const [isExportingAll, setIsExportingAll] = React.useState(false);
  const [isRegeneratingAll, setIsRegeneratingAll] = React.useState(false);
  const [outdatedSlideIds, setOutdatedSlideIds] = React.useState<Set<string>>(new Set());

  const activeSlide = slides[activeSlideIndex];
  const imagesReady = slides.filter(s => s.imageUrl).length;
  const readyToPublish = slides.some(s => s.imageUrl);

  const slidesRef = React.useRef(slides);
  slidesRef.current = slides;
  const regenRef = React.useRef(handleRegenerateSlideImage);
  regenRef.current = handleRegenerateSlideImage;

  const handleDownloadActive = () => {
    const slide = slides[activeSlideIndex];
    if (!slide) return;
    const link = document.createElement('a');
    link.download = `socialpro-slide-${activeSlideIndex + 1}.png`;
    link.href = slide.imageUrl ?? (renderGradientSlide(slide, activeSlideIndex)?.toDataURL('image/png') ?? '');
    link.click();
    toast.success('Slide baixado', `Slide ${activeSlideIndex + 1}`);
  };

  const renderGradientSlide = (slide: Slide, index: number): HTMLCanvasElement | null => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080; canvas.height = 1350;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const grad = ctx.createLinearGradient(0, 0, 0, 1350);
    grad.addColorStop(0, '#0b0c10'); grad.addColorStop(1, '#171923');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, 1080, 1350);
    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 64px sans-serif';
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText(slide?.title || '', 80, 260);
    return canvas;
  };

  const handleDownloadAll = async () => {
    if (isExportingAll) return;
    setIsExportingAll(true);
    try {
      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        const link = document.createElement('a');
        link.download = `socialpro-slide-${i + 1}.png`;
        link.href = slide?.imageUrl ?? (renderGradientSlide(slide, i)?.toDataURL('image/png') ?? '');
        link.click();
        await new Promise(r => setTimeout(r, 350));
      }
      toast.success('Download concluído', `${slides.length} slides baixados`);
    } finally { setIsExportingAll(false); }
  };

  const handleMoveSlide = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= slides.length) return;
    const updated = [...slides];
    [updated[index], updated[target]] = [updated[target], updated[index]];
    setSlides(updated);
    setActiveSlideIndex(target);
  };

  const handleDuplicateSlide = (index: number) => {
    if (slides.length >= 16) return;
    const src = slides[index];
    if (!src) return;
    const copy: Slide = {
      ...src,
      id: Math.random().toString(36).slice(2, 9),
      imageUrl: undefined,
      isGeneratingImage: false,
    };
    const updated = [...slides.slice(0, index + 1), copy, ...slides.slice(index + 1)];
    setSlides(updated);
    setCarouselSlideCount(updated.length);
    setActiveSlideIndex(index + 1);
  };

  const handleDeleteSlide = (index: number) => {
    if (slides.length <= 1) return;
    const updated = slides.filter((_, i) => i !== index);
    setSlides(updated);
    setCarouselSlideCount(updated.length);
    if (activeSlideIndex >= updated.length) setActiveSlideIndex(updated.length - 1);
  };

  const handleAddSlide = () => {
    if (slides.length >= 16) return;
    const newSlide: Slide = {
      id: Math.random().toString(36).slice(2, 9),
      title: `Slide ${slides.length + 1}`,
      subtitle: 'Texto de apoio do slide.',
      background: GRADIENTS[slides.length % GRADIENTS.length],
      imagePrompt: carouselTopic ? `Professional illustration related to "${carouselTopic}"` : 'Abstract professional illustration, dark premium aesthetic',
    };
    const newCount = slides.length + 1;
    setSlides([...slides, newSlide]);
    setActiveSlideIndex(slides.length);
    setCarouselSlideCount(newCount);
  };

  const handleUpdateActiveSlide = (field: 'title' | 'subtitle', value: string) => {
    const updated = slides.map((s, i) => (i === activeSlideIndex ? { ...s, [field]: value } : s));
    setSlides(updated);
  };

  const selectSlide = React.useCallback((i: number) => setActiveSlideIndex(i), [setActiveSlideIndex]);
  
  const duplicateSlideStable = React.useCallback((i: number) => {
    const cur = slidesRef.current;
    if (cur.length >= 16) return;
    const src = cur[i];
    if (!src) return;
    const copy: Slide = { ...src, id: Math.random().toString(36).slice(2, 9), imageUrl: undefined, isGeneratingImage: false };
    const updated = [...cur.slice(0, i + 1), copy, ...cur.slice(i + 1)];
    setSlides(updated);
    setCarouselSlideCount(updated.length);
    setActiveSlideIndex(i + 1);
  }, [setSlides, setCarouselSlideCount, setActiveSlideIndex]);

  const regenerateSlideStable = React.useCallback((i: number) => {
    const s = slidesRef.current[i];
    if (!s) return;
    setOutdatedSlideIds(prev => { const n = new Set(prev); n.delete(s.id); return n; });
    regenRef.current(s.id, s.title, s.subtitle, s.imagePrompt || '');
    toast.info('Regerando imagem do slide…');
  }, []);

  const handleRegenerateSlide = (slideId: string, title: string, subtitle: string, imagePrompt: string) => {
    setOutdatedSlideIds(prev => { const next = new Set(prev); next.delete(slideId); return next; });
    handleRegenerateSlideImage(slideId, title, subtitle, imagePrompt);
    toast.info('Regerando imagem do slide…');
  };

  return (
    <div className="flex-1 flex flex-col rounded-3xl border border-dark-border bg-dark-panel overflow-hidden min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-dark-border flex-wrap gap-3">
        <div className="flex items-center gap-2.5 min-w-0 flex-wrap">
          <span className="text-sm font-bold text-white flex-shrink-0">{t('slides')}</span>
          <span className="flex items-center gap-2 text-[10.5px] text-white/40 px-2 py-0.5 rounded-lg border border-dark-border flex-shrink-0 bg-white/[0.02]">
            <span className="font-semibold text-white/60">{slides.length}</span> slides
            <span className="h-3 w-px bg-dark-border" />
            <span className="font-bold text-accent-cyan">{imagesReady}/{slides.length}</span> gerados
          </span>
          
          {/* Status Badge */}
          <div className="flex items-center gap-1.5 text-[9.5px] font-medium flex-shrink-0">
            {isGeneratingCarousel || isRegeneratingAll ? (
              <span className="text-accent-cyan flex items-center gap-1 bg-accent-cyan/[0.06] border border-accent-cyan/15 px-2 py-0.5 rounded-md font-bold animate-pulse">
                <Loader2 className="h-2.5 w-2.5 animate-spin" /> Gerando...
              </span>
            ) : (
              <span className="text-emerald-400 flex items-center gap-1 bg-emerald-500/[0.06] border border-emerald-500/15 px-2 py-0.5 rounded-md font-bold">
                <Check className="h-2.5 w-2.5" /> Salvo
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap">
          {/* Novo: confirma e reinicia fluxo */}
          <motion.button
            onClick={onOpenConfirmNewPost}
            disabled={isGeneratingCarousel}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            title="Iniciar um novo post do zero"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10.5px] font-bold border border-white/[0.08] bg-[#14161e] text-white/60 hover:text-accent-purple hover:border-accent-purple/30 disabled:opacity-35 transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden xl:inline">Novo</span>
          </motion.button>

          {/* Ajustar: abre o wizard sem regenerar */}
          <motion.button
            onClick={onOpenWizard}
            disabled={isGeneratingCarousel}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            title="Ajustar estilo, tom e configurações"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10.5px] font-bold border border-white/[0.08] bg-[#14161e] text-white/60 hover:text-accent-purple hover:border-accent-purple/30 disabled:opacity-35 transition-colors cursor-pointer"
          >
            <Sliders className="h-3.5 w-3.5" />
            <span className="hidden xl:inline">Ajustar</span>
          </motion.button>

          {/* Refazer: confirm + regenera do zero */}
          <motion.button
            onClick={onOpenConfirmRedo}
            disabled={isGeneratingCarousel || isRegeneratingAll}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            title="Regerar todos os slides do zero"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10.5px] font-bold border border-white/[0.08] bg-[#14161e] text-white/60 hover:text-amber-400 hover:border-amber-500/30 disabled:opacity-35 transition-colors cursor-pointer"
          >
            {isGeneratingCarousel ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            <span className="hidden xl:inline">Refazer</span>
          </motion.button>

          <span className="h-4 w-px bg-white/[0.08] mx-0.5 hidden xl:inline" />

          <motion.button
            onClick={handleDownloadAll}
            disabled={isExportingAll || !readyToPublish}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10.5px] font-bold text-white bg-gradient-to-r from-accent-purple/90 to-accent-cyan/90 hover:from-accent-purple hover:to-accent-cyan disabled:opacity-35 transition-all cursor-pointer shadow-[0_2px_8px_rgba(139,92,246,0.15)] hover:shadow-[0_4px_12px_rgba(139,92,246,0.3)] border border-white/10"
          >
            {isExportingAll ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
            <span>Baixar imagens</span>
          </motion.button>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
        {/* Mosaico até 16 slots */}
        <div className="grid grid-cols-4 gap-2.5">
          {Array.from({ length: 16 }, (_, slotIdx) => {
            const slide = slides[slotIdx];
            const isActive = slotIdx < carouselSlideCount;
            const isSelected = slotIdx === activeSlideIndex;

            if (!isActive) {
              const isNext = slotIdx === carouselSlideCount;
              return (
                <button key={slotIdx}
                  className={`group aspect-[4/5] rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all bg-white/[0.02] border-dark-border cursor-pointer ${
                    isNext
                      ? 'border-dashed border-white/[0.10] hover:border-accent-purple/50 hover:bg-accent-purple/[0.04]'
                      : 'border-white/[0.04] hover:border-white/[0.10]'
                  }`}
                  onClick={() => setCarouselSlideCount(slotIdx + 1)}
                  title={`Expandir para ${slotIdx + 1} slides`}
                >
                  <Plus className={`h-4 w-4 transition-all ${isNext ? 'text-white/25 group-hover:text-accent-purple group-hover:scale-110' : 'text-white/[0.08]'}`} />
                  <span className={`text-[9px] font-bold ${isNext ? 'text-white/25' : 'text-white/[0.08]'}`}>{slotIdx + 1}</span>
                </button>
              );
            }

            if (isGeneratingCarousel && !slide) {
              return (
                <div key={slotIdx}
                  className="aspect-[4/5] rounded-2xl border border-dark-border overflow-hidden bg-white/[0.03] shimmer flex items-center justify-center"
                  style={{ animationDelay: `${slotIdx * 80}ms` }}
                >
                  <span className="text-[9px] font-bold text-white/15 tabular-nums">{slotIdx + 1}</span>
                </div>
              );
            }

            if (!slide) {
              return (
                <button key={slotIdx} onClick={handleAddSlide}
                  className="group aspect-[4/5] rounded-2xl border-2 border-dashed border-white/[0.10] hover:border-accent-purple/50 hover:bg-accent-purple/[0.04] flex flex-col items-center justify-center gap-1.5 transition-all text-white/25 hover:text-accent-purple cursor-pointer p-2">
                  <span className="h-7 w-7 rounded-xl border border-white/[0.10] group-hover:border-accent-purple/40 flex items-center justify-center transition-colors">
                    <Plus className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  </span>
                  <span className="text-[9px] font-bold text-center leading-tight">Adicionar<br/>slide {slotIdx + 1}</span>
                </button>
              );
            }

            return (
              <SlideCard
                key={slide.id}
                slide={slide} index={slotIdx} isActive={isSelected} total={carouselSlideCount}
                isOutdated={outdatedSlideIds.has(slide.id)}
                canDuplicate={slides.length < 16}
                onSelect={selectSlide}
                onDelete={onConfirmDeleteIndex}
                onDuplicate={duplicateSlideStable}
                onRegenerate={regenerateSlideStable}
              />
            );
          })}
        </div>
      </div>

      {/* Editor contextual do slide selecionado */}
      {activeSlide && !isGeneratingCarousel && (
        <div className="flex-shrink-0 border-t border-dark-border p-4 space-y-2.5 bg-white/[0.02]">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-white/55">
              <Pencil className="h-3.5 w-3.5 text-accent-purple" />
              Editando · Slide {activeSlideIndex + 1}<span className="text-white/30">/{carouselSlideCount}</span>
            </span>
            <div className="flex items-center gap-1">
              <button title="Mover para a esquerda" disabled={activeSlideIndex === 0}
                onClick={() => handleMoveSlide(activeSlideIndex, -1)}
                className="h-7 w-7 rounded-lg flex items-center justify-center border border-white/[0.08] text-white/45 hover:text-white hover:border-white/[0.18] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer">
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button title="Mover para a direita" disabled={activeSlideIndex >= carouselSlideCount - 1}
                onClick={() => handleMoveSlide(activeSlideIndex, 1)}
                className="h-7 w-7 rounded-lg flex items-center justify-center border border-white/[0.08] text-white/45 hover:text-white hover:border-white/[0.18] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer">
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
              <span className="h-4 w-px bg-white/[0.08] mx-0.5" />
              <button title="Duplicar slide" disabled={slides.length >= 16}
                onClick={() => handleDuplicateSlide(activeSlideIndex)}
                className="h-7 w-7 rounded-lg flex items-center justify-center border border-white/[0.08] text-white/45 hover:text-accent-cyan hover:border-accent-cyan/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer">
                <Copy className="h-3.5 w-3.5" />
              </button>
              <button title="Baixar este slide"
                onClick={handleDownloadActive}
                className="h-7 w-7 rounded-lg flex items-center justify-center border border-white/[0.08] text-white/45 hover:text-white hover:border-white/[0.18] transition-colors cursor-pointer">
                <Download className="h-3.5 w-3.5" />
              </button>
              <button title="Excluir slide" disabled={slides.length <= 1}
                onClick={() => onConfirmDeleteIndex(activeSlideIndex)}
                className="h-7 w-7 rounded-lg flex items-center justify-center border border-white/[0.08] text-white/45 hover:text-rose-400 hover:border-rose-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[200px_minmax(0,1fr)] gap-3">
            <div className="space-y-1">
              <span className="text-[9.5px] font-bold text-white/35 uppercase tracking-wider block px-0.5">Título do Slide</span>
              <input
                value={activeSlide.title}
                onChange={e => handleUpdateActiveSlide('title', e.target.value)}
                placeholder={t('titlePlaceholder')}
                className="w-full bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.08] focus:border-accent-purple/40 rounded-xl px-3 py-2 text-[12px] font-bold text-white outline-none placeholder:text-white/20 transition-all"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[9.5px] font-bold text-white/35 uppercase tracking-wider block px-0.5">Texto de Apoio / Subtítulo</span>
              <input
                value={activeSlide.subtitle}
                onChange={e => handleUpdateActiveSlide('subtitle', e.target.value)}
                placeholder={t('subtitlePlaceholder')}
                className="w-full bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.08] focus:border-accent-purple/40 rounded-xl px-3 py-2 text-[12px] text-white/80 outline-none placeholder:text-white/20 transition-all"
              />
            </div>
          </div>

          {activeSlide.imagePrompt && (
            <motion.button
              onClick={() => handleRegenerateSlide(activeSlide.id, activeSlide.title, activeSlide.subtitle, activeSlide.imagePrompt || '')}
              disabled={activeSlide.isGeneratingImage}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} transition={spring}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-bold text-white border border-accent-purple/30 bg-accent-purple/[0.08] hover:bg-accent-purple/[0.14] disabled:opacity-50 transition-colors cursor-pointer"
            >
              {activeSlide.isGeneratingImage
                ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Gerando imagem...</>
                : <><RefreshCw className="h-3.5 w-3.5" />{activeSlide.imageUrl ? 'Regerar imagem deste slide' : 'Gerar imagem deste slide'}</>}
            </motion.button>
          )}
        </div>
      )}
    </div>
  );
}
