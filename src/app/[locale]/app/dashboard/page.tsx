"use client";
import React from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import { CarouselCard } from '@/components/cards/CarouselCard';
import { TextPostCard } from '@/components/cards/TextPostCard';
import { Linkedin, Twitter, Instagram } from '@/components/icons';
import type { PlatformType, Slide, CarouselStyleModel } from '@/types';
import {
  Copy, Check, Loader2, Send, X, Info, Clock,
  Download, Plus, RefreshCw, ImageIcon, Wand2, ExternalLink, Calendar, Sparkles,
} from 'lucide-react';

// ─── Style definitions ───────────────────────────────────────────────────────

const PHOTO_STYLES: { id: CarouselStyleModel; name: string; swatch: string }[] = [
  { id: 'lifestyle',  name: 'Lifestyle', swatch: 'linear-gradient(135deg,#d97706,#1c1713)' },
  { id: 'tech',       name: 'Cyber',     swatch: 'linear-gradient(135deg,#8b5cf6,#06b6d4)' },
  { id: 'alert',      name: 'Alerta',    swatch: 'linear-gradient(135deg,#7f1d1d,#f59e0b)' },
  { id: 'minimalist', name: 'Minimal',   swatch: 'linear-gradient(135deg,#0b0c10,#374151)' },
  { id: 'feminino',   name: 'Feminino',  swatch: 'linear-gradient(135deg,#f43f5e,#ec4899,#f9a8d4)' },
  { id: 'neutro',     name: 'Neutro',    swatch: 'linear-gradient(135deg,#d4b896,#f5f0e8,#c9a87a)' },
  { id: 'retro',      name: 'Retrô',     swatch: 'linear-gradient(135deg,#92400e,#b45309,#fbbf24)' },
];

const AVATAR_STYLES: { id: CarouselStyleModel; name: string; swatch: string }[] = [
  { id: 'infantil',   name: 'Infantil',  swatch: 'linear-gradient(135deg,#fb923c,#facc15,#4ade80)' },
  { id: 'pixar',      name: '3D Pixar',  swatch: 'linear-gradient(135deg,#60a5fa,#a78bfa,#f472b6)' },
  { id: 'anime',      name: 'Anime',     swatch: 'linear-gradient(135deg,#f472b6,#fb923c,#facc15)' },
  { id: 'aquarela',   name: 'Aquarela',  swatch: 'linear-gradient(135deg,#7dd3fc,#86efac,#fde68a)' },
  { id: 'flat',       name: 'Flat Art',  swatch: 'linear-gradient(135deg,#10b981,#3b82f6,#8b5cf6)' },
  { id: 'cartoon',    name: 'Cartoon',   swatch: 'linear-gradient(135deg,#ef4444,#f97316,#facc15)' },
];

const AVATAR_IDS: CarouselStyleModel[] = AVATAR_STYLES.map(s => s.id);

function StyleChip({ id, name, swatch, active, disabled, onClick }: {
  id: CarouselStyleModel; name: string; swatch: string;
  active: boolean; disabled: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all duration-150 active:scale-95 disabled:opacity-50 ${
        active
          ? 'border-accent-purple bg-accent-purple/15 text-dark-text shadow-[0_0_8px_rgba(139,92,246,0.3)]'
          : 'border-dark-border bg-dark-border/30 text-dark-muted hover:border-accent-purple/40 hover:text-dark-text'
      }`}
    >
      <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: swatch }} />
      {name}
    </button>
  );
}

function StylePicker({ styleModel, onSelect, disabled }: {
  styleModel: CarouselStyleModel;
  onSelect: (s: CarouselStyleModel) => void;
  disabled: boolean;
}) {
  const isAvatar = AVATAR_IDS.includes(styleModel);
  const tStyles = useTranslations('styles');
  const tDash   = useTranslations('dashboard');

  return (
    <div className="glass-panel rounded-2xl border border-dark-border px-4 py-3 space-y-2.5 animate-fade-in" style={{ animationDelay: '80ms' }}>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[9px] font-bold text-dark-muted uppercase tracking-wider w-8 flex-shrink-0">{tDash('styleLabel')}</span>
        {PHOTO_STYLES.map(s => (
          <StyleChip key={s.id} {...s} name={tStyles(s.id)} active={styleModel === s.id} disabled={disabled} onClick={() => onSelect(s.id)} />
        ))}
        <StyleChip
          id="infantil" name={tStyles('infantil')} swatch="linear-gradient(135deg,#fb923c,#facc15,#4ade80)"
          active={isAvatar} disabled={disabled}
          onClick={() => onSelect(isAvatar ? 'lifestyle' : 'infantil')}
        />
      </div>

      {isAvatar && (
        <div className="flex items-center gap-2 flex-wrap animate-fade-in">
          <span className="text-[9px] font-bold text-dark-muted uppercase tracking-wider w-8 flex-shrink-0">{tDash('avatarLabel')}</span>
          {AVATAR_STYLES.map(s => (
            <StyleChip key={s.id} {...s} name={tStyles(s.id)} active={styleModel === s.id} disabled={disabled} onClick={() => onSelect(s.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const FORMATS: { id: PlatformType; label: string; icon: React.FC<{ className?: string }>; color: string }[] = [
  { id: 'instagram', label: 'Instagram',  icon: Instagram, color: 'text-pink-400'  },
  { id: 'x',         label: 'X / Twitter', icon: Twitter,   color: 'text-sky-400'   },
  { id: 'linkedin',  label: 'LinkedIn',    icon: Linkedin,  color: 'text-blue-400'  },
];

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

function PublishModal({ platform, onClose }: { platform: PlatformType; onClose: () => void }) {
  const label = FORMATS.find(f => f.id === platform)?.label ?? platform;
  const tPub = useTranslations('publish');
  const publishSteps = [tPub('connect'), tPub('configure'), tPub('authorize')];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-sm glass-panel-heavy rounded-2xl border border-dark-border p-5 space-y-4" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 text-dark-muted hover:text-dark-text"><X className="h-4 w-4" /></button>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-accent-purple/10 border border-accent-purple/20">
            <Send className="h-4 w-4 text-accent-purple" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-dark-text">{tPub('title')} {label}</h3>
            <p className="text-[10px] text-dark-muted">{tPub('subtitle')}</p>
          </div>
        </div>
        <div className="space-y-2">
          {publishSteps.map((s, i) => (
            <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-dark-border/30 border border-dark-border">
              <Clock className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
              <span className="text-xs text-dark-muted">{s}</span>
            </div>
          ))}
        </div>
        <div className="p-3 rounded-xl bg-accent-cyan/5 border border-accent-cyan/15 flex gap-2">
          <Info className="h-3.5 w-3.5 text-accent-cyan flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-dark-muted leading-relaxed">{tPub('comingSoon')}</p>
        </div>
        <button onClick={onClose} className="w-full py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-accent-purple to-accent-cyan">{tPub('understood')}</button>
      </div>
    </div>
  );
}

function SlideCard({
  slide, index, isActive, total, isOutdated,
  onClick, onDelete, onRegenerate,
}: {
  slide: Slide; index: number; isActive: boolean; total: number; isOutdated: boolean;
  onClick: () => void; onDelete: () => void; onRegenerate: () => void;
}) {
  return (
    <div className="relative group">
      <button
        onClick={onClick}
        className={`relative w-full aspect-[4/5] rounded-2xl overflow-hidden border-2 transition-all duration-300 ease-out block ${
          isActive
            ? 'border-accent-purple shadow-[0_0_28px_rgba(139,92,246,0.5)] scale-[1.03] z-10'
            : 'border-dark-border hover:border-accent-purple/60 hover:shadow-[0_8px_28px_rgba(0,0,0,0.5)] hover:scale-[1.02] hover:-translate-y-0.5'
        }`}
      >
        {/* Background */}
        {slide.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={slide.imageUrl} alt={slide.title} className="w-full h-full object-cover" />
        ) : slide.isGeneratingImage ? (
          <div className="w-full h-full bg-dark-border flex flex-col items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 text-accent-purple animate-spin" />
            <span className="text-[9px] text-dark-muted font-semibold">Gerando...</span>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col justify-between p-3" style={{ background: slide.background }}>
            <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">SLIDE {index + 1}</span>
            <div className="space-y-1">
              <p className="text-[11px] font-extrabold text-white leading-tight line-clamp-3">{slide.title || 'Título'}</p>
              <p className="text-[9px] text-white/70 leading-snug line-clamp-2">{slide.subtitle}</p>
            </div>
          </div>
        )}

        {/* Slide number badge */}
        <span className="absolute top-2 left-2 text-[9px] font-black text-white bg-black/60 backdrop-blur-sm rounded-md px-1.5 py-0.5 leading-tight">
          {index + 1}/{total}
        </span>

        {/* Outdated image indicator */}
        {isOutdated && (
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]" title="Texto editado — regenere a imagem" />
        )}

        {/* Regenerate overlay */}
        {slide.imagePrompt && (
          <div
            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
            onClick={e => { e.stopPropagation(); onRegenerate(); }}
          >
            <div className="flex flex-col items-center gap-1.5">
              <div className="p-2 rounded-full bg-white/10 border border-white/20">
                <RefreshCw className="h-4 w-4 text-white" />
              </div>
              <span className="text-[9px] text-white/80 font-semibold">Regerar</span>
            </div>
          </div>
        )}

        {/* No image yet indicator */}
        {!slide.imageUrl && !slide.isGeneratingImage && (
          <div className="absolute bottom-2 right-2 p-1 rounded-md bg-black/40 border border-white/10">
            <ImageIcon className="h-3 w-3 text-white/40" />
          </div>
        )}
      </button>

      {/* Delete button */}
      {total > 1 && isActive && (
        <button
          onClick={e => { e.stopPropagation(); onDelete(); }}
          className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-red-500/90 text-white flex items-center justify-center z-10 shadow-md hover:bg-red-500 transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

function DashboardPage() {
  const t = useTranslations('dashboard');
  const tPublish = useTranslations('publish');
  const searchParams = useSearchParams();
  const {
    platform, setPlatform,
    tone, setTone,
    content, setContent,
    slides, setSlides,
    activeSlideIndex, setActiveSlideIndex,
    isGenerating,
    styleModel, setStyleModel,
    watermarkType, setWatermarkType,
    brandKit,
    carouselTopic, setCarouselTopic,
    carouselSlideCount, setCarouselSlideCount,
    referenceImage, setReferenceImage,
    isGeneratingCarousel, lastCarouselSource,
    handleGenerateCarousel, handleRegenerateSlideImage, handleRegenerateAllImages,
    handleRefineCaption, handleGenerateTextPost,
    subscription,
    upgradeModalOpen, setUpgradeModalOpen, upgradeReason,
    loadSubscription,
  } = useAppContext();

  // Load carousel from history when ?load=<id> is in the URL
  React.useEffect(() => {
    const carouselId = searchParams?.get('load');
    if (!carouselId) return;
    fetch(`/api/carousels/${carouselId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data?.carousel) return;
        const { carousel } = data;
        const dbSlides: Slide[] = (carousel.slides ?? []).map((s: Slide) => ({
          ...s,
          isGeneratingImage: false,
        }));
        if (dbSlides.length) {
          setSlides(dbSlides);
          setActiveSlideIndex(0);
          if (carousel.topic) setCarouselTopic(carousel.topic);
          if (carousel.caption) setContent(carousel.caption);
          setPlatform('instagram');
        }
      })
      .catch(console.error);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [copied,           setCopied]           = React.useState(false);
  const [showPublish,      setShowPublish]       = React.useState(false);
  const [isExportingAll,   setIsExportingAll]   = React.useState(false);
  const [isRegeneratingAll, setIsRegeneratingAll] = React.useState(false);
  const [outdatedSlideIds, setOutdatedSlideIds] = React.useState<Set<string>>(new Set());

  // Instagram publish state machine
  type PublishState = 'idle' | 'publishing' | 'success' | 'error';
  const [publishState,   setPublishState]   = React.useState<PublishState>('idle');
  const [publishError,   setPublishError]   = React.useState('');
  const [publishPermalink, setPublishPermalink] = React.useState('');

  // Caption variations
  const [captionVariations, setCaptionVariations] = React.useState<{angle: string; caption: string}[]>([]);
  const [loadingVariations,  setLoadingVariations]  = React.useState(false);
  const [showVariations,     setShowVariations]     = React.useState(false);

  // Schedule
  const [showSchedule,  setShowSchedule]  = React.useState(false);
  const [scheduleDate,  setScheduleDate]  = React.useState('');
  const [schedulingSave, setSchedulingSave] = React.useState(false);
  const [scheduleOk,    setScheduleOk]    = React.useState(false);

  const isCarousel    = platform === 'instagram';
  const readyToPublish = isCarousel ? slides.some(s => s.imageUrl) : content.trim().length > 0;
  const activeSlide   = slides[activeSlideIndex];
  const imagesReady   = slides.filter(s => s.imageUrl).length;

  const handleGenerateVariations = async () => {
    if (!slides.length && !content.trim()) return;
    setLoadingVariations(true);
    setShowVariations(true);
    try {
      const res = await fetch('/api/ai/caption-variations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: carouselTopic,
          tone,
          slides: slides.map(s => ({ title: s.title, subtitle: s.subtitle })),
          aiBio: brandKit.aiBio,
        }),
      });
      if (res.ok) { const { variations } = await res.json(); setCaptionVariations(variations ?? []); }
    } catch { /* ignore */ }
    finally { setLoadingVariations(false); }
  };

  const handleSchedulePost = async () => {
    if (!scheduleDate) return;
    setSchedulingSave(true);
    try {
      // Find the current carousel ID from the URL
      const urlParams = new URLSearchParams(window.location.search);
      const carouselId = urlParams.get('load');
      const res = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carouselId, caption: content, scheduledFor: new Date(scheduleDate).toISOString() }),
      });
      if (res.ok) { setScheduleOk(true); setTimeout(() => { setScheduleOk(false); setShowSchedule(false); }, 2000); }
    } catch { /* ignore */ }
    finally { setSchedulingSave(false); }
  };

  const handleCopyCaption = async () => {
    try { await navigator.clipboard.writeText(content); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /**/ }
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
    } finally { setIsExportingAll(false); }
  };

  const handleDownloadActive = () => {
    const slide = slides[activeSlideIndex];
    const link = document.createElement('a');
    link.download = `socialpro-slide-${activeSlideIndex + 1}.png`;
    link.href = slide?.imageUrl ?? (renderGradientSlide(slide, activeSlideIndex)?.toDataURL('image/png') ?? '');
    link.click();
  };

  const handlePublishToInstagram = async () => {
    if (publishState === 'publishing') return;
    setPublishState('publishing');
    setPublishError('');
    setPublishPermalink('');
    try {
      const res = await fetch('/api/instagram/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slides: slides.map(s => ({ imageUrl: s.imageUrl ?? '', title: s.title, subtitle: s.subtitle })),
          caption: content,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? 'Erro ao publicar.');
      setPublishState('success');
      if (data.permalink) setPublishPermalink(data.permalink);
      // Reset after 8s
      setTimeout(() => { setPublishState('idle'); setPublishPermalink(''); }, 8000);
    } catch (err) {
      setPublishState('error');
      setPublishError(err instanceof Error ? err.message : 'Erro desconhecido.');
      setTimeout(() => setPublishState('idle'), 6000);
    }
  };

  const handleRegenerateSlide = (slideId: string, title: string, subtitle: string, imagePrompt: string) => {
    setOutdatedSlideIds(prev => { const next = new Set(prev); next.delete(slideId); return next; });
    handleRegenerateSlideImage(slideId, title, subtitle, imagePrompt);
  };

  const handleRegenerateAll = async () => {
    if (isRegeneratingAll) return;
    setIsRegeneratingAll(true);
    setOutdatedSlideIds(new Set());
    try {
      await handleRegenerateAllImages();
    } finally {
      setIsRegeneratingAll(false);
    }
  };

  const handleAddSlide = () => {
    if (slides.length >= 8) return;
    const newSlide: Slide = {
      id: Math.random().toString(36).slice(2, 9),
      title: `Slide ${slides.length + 1}`,
      subtitle: 'Texto de apoio do slide.',
      background: GRADIENTS[slides.length % GRADIENTS.length],
      imagePrompt: carouselTopic ? `Professional illustration related to "${carouselTopic}"` : 'Abstract professional illustration, dark premium aesthetic',
    };
    setSlides([...slides, newSlide]);
    setActiveSlideIndex(slides.length);
  };

  const handleDeleteSlide = (index: number) => {
    if (slides.length <= 1) return;
    const updated = slides.filter((_, i) => i !== index);
    setSlides(updated);
    if (activeSlideIndex >= updated.length) setActiveSlideIndex(updated.length - 1);
  };

  return (
    <>
      {showPublish && <PublishModal platform={platform} onClose={() => setShowPublish(false)} />}

      <div className="space-y-4 w-full">

        {/* ── Platform tabs ── */}
        <div className="flex items-center gap-1 p-1 glass-panel rounded-xl border border-dark-border w-fit animate-fade-in">
          {FORMATS.map(f => {
            const Icon = f.icon;
            const active = platform === f.id;
            return (
              <button key={f.id} onClick={() => setPlatform(f.id)}
                className={`btn-press flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  active ? 'bg-accent-purple/20 border border-accent-purple/30 text-dark-text' : 'text-dark-muted hover:text-dark-text border border-transparent'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${active ? f.color : ''}`} />
                <span className="hidden sm:inline">{f.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── Subscription usage bar ── */}
        {subscription && (() => {
          const used      = subscription.carousels_used;
          const limit     = subscription.carousel_limit;
          const remaining = Math.max(limit - used, 0);
          const pct       = limit > 0 ? Math.min((used / limit) * 100, 100) : 100;
          const planLabels: Record<string, string> = { free: 'Free', intro: 'Intro', pro: 'Pro', agency: 'Agency' };
          const planLabel = planLabels[subscription.plan_id] ?? subscription.plan_id;
          const isWarning = remaining > 0 && remaining <= 3;
          const isEmpty   = limit === 0 || (subscription.status !== 'active' && subscription.status !== 'trialing');
          const barColor  = isEmpty || remaining === 0
            ? 'bg-red-500'
            : isWarning
              ? 'bg-gradient-to-r from-amber-400 to-orange-400'
              : 'bg-gradient-to-r from-accent-purple to-accent-cyan';
          const borderColor = isEmpty || remaining === 0
            ? 'border-red-500/30'
            : isWarning
              ? 'border-amber-500/30'
              : 'border-dark-border';

          return (
            <div className={`glass-panel rounded-2xl border ${borderColor} px-4 py-3 space-y-2 transition-colors`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-dark-muted">Gerações este mês</span>
                  <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border tracking-wider ${
                    subscription.status === 'active' || subscription.status === 'trialing'
                      ? 'bg-accent-purple/10 border-accent-purple/20 text-accent-purple'
                      : 'bg-white/5 border-white/10 text-dark-muted'
                  }`}>{planLabel}</span>
                </div>
                {isEmpty ? (
                  <span className="text-[10px] font-bold text-red-400">Sem plano ativo</span>
                ) : (
                  <span className={`text-[11px] font-extrabold ${remaining === 0 ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-white'}`}>
                    {remaining} restantes
                  </span>
                )}
              </div>
              <div className="h-2 w-full rounded-full bg-dark-border overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                  style={{ width: `${pct}%` }} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-dark-muted">{used} de {limit} usados</span>
                {(isWarning || remaining === 0) && !isEmpty && (
                  <button
                    onClick={() => { setUpgradeModalOpen(true); }}
                    className="text-[9px] font-bold text-accent-cyan hover:underline"
                  >
                    {remaining === 0 ? 'Limite atingido — fazer upgrade' : 'Upgrade para mais gerações →'}
                  </button>
                )}
                {isEmpty && (
                  <button
                    onClick={() => setUpgradeModalOpen(true)}
                    className="text-[9px] font-bold text-accent-cyan hover:underline"
                  >
                    Assinar um plano →
                  </button>
                )}
              </div>
            </div>
          );
        })()}

        {/* ── Style picker (Instagram only) — before the generator ── */}
        {isCarousel && <StylePicker styleModel={styleModel} onSelect={setStyleModel} disabled={isGeneratingCarousel} />}

        {/* ── Studio card ── */}
        <div className="animate-fade-in" style={{ animationDelay: '60ms' }}>
        {isCarousel ? (
          <CarouselCard
            slides={slides} activeSlideIndex={activeSlideIndex}
            onUpdateSlides={setSlides} onSetActiveSlide={setActiveSlideIndex}
            styleModel={styleModel} onUpdateStyleModel={setStyleModel}
            watermarkType={watermarkType} onUpdateWatermarkType={setWatermarkType}
            brandName={brandKit.brandName} brandHandle={brandKit.brandHandle} avatarUrl={brandKit.avatarUrl}
            carouselTopic={carouselTopic} onUpdateCarouselTopic={setCarouselTopic}
            carouselSlideCount={carouselSlideCount} onUpdateCarouselSlideCount={setCarouselSlideCount}
            isGeneratingCarousel={isGeneratingCarousel} lastCarouselSource={lastCarouselSource}
            onGenerateCarousel={handleGenerateCarousel} onRegenerateSlideImage={handleRegenerateSlideImage}
            tone={tone} onUpdateTone={setTone}
            referenceImage={referenceImage} onUpdateReferenceImage={setReferenceImage}
          />
        ) : (
          <TextPostCard
            platform={platform} topic={carouselTopic} onUpdateTopic={setCarouselTopic}
            tone={tone} onUpdateTone={setTone} content={content} onUpdateContent={setContent}
            isGenerating={isGenerating} onGenerate={handleGenerateTextPost} onRefine={handleRefineCaption}
          />
        )}
        </div>

        {/* ── Slides grid (only for Instagram) ── */}
        {isCarousel && (
          <div className="glass-panel rounded-2xl border border-dark-border overflow-hidden animate-fade-in" style={{ animationDelay: '120ms' }}>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-dark-border">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold text-dark-text uppercase tracking-wider">{t('slides')}</span>
                <span className="text-[10px] text-dark-muted bg-dark-border/60 px-2 py-0.5 rounded-full">
                  {slides.length} · {imagesReady} {t('withImage')}
                </span>
              </div>
              <button
                onClick={handleRegenerateAll}
                disabled={isRegeneratingAll || isGeneratingCarousel}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border border-dark-border text-dark-muted hover:text-dark-text hover:border-accent-purple/40 disabled:opacity-50 transition-all"
              >
                {isRegeneratingAll ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                {t('regenerateAll')}
              </button>
            </div>

            <div className="p-4 space-y-3">
              {/* Skeleton grid — shown while fetching slide text */}
              {isGeneratingCarousel ? (
                <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
                  {Array.from({ length: carouselSlideCount }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-[4/5] rounded-2xl border-2 border-dark-border overflow-hidden"
                      style={{ animationDelay: `${i * 80}ms` }}
                    >
                      <div className="w-full h-full shimmer bg-dark-border/40 flex flex-col justify-between p-3">
                        {/* Top pill */}
                        <div className="h-3 w-10 rounded-full bg-white/10" />
                        {/* Bottom lines */}
                        <div className="space-y-2">
                          <div className="h-3 w-4/5 rounded-full bg-white/10" />
                          <div className="h-2 w-3/5 rounded-full bg-white/8" />
                          <div className="h-2 w-2/4 rounded-full bg-white/6" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : slides.length === 0 ? (
              /* Empty state — guide user to generate first carousel */
              <div className="flex flex-col items-center justify-center py-10 space-y-5 animate-fade-in">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-purple/20 to-accent-cyan/20 border border-accent-purple/20 flex items-center justify-center animate-float">
                    <Sparkles className="h-8 w-8 text-accent-purple" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent-cyan animate-ping opacity-60" />
                </div>
                <div className="text-center space-y-1.5 max-w-xs">
                  <h3 className="text-sm font-bold text-dark-text">Pronto para criar?</h3>
                  <p className="text-xs text-dark-muted leading-relaxed">
                    Escolha um estilo acima, escreva o tema do carrossel e clique em <span className="text-accent-purple font-semibold">Gerar carrossel</span>.
                  </p>
                </div>
                <div className="flex items-center gap-6 text-[10px] text-dark-muted">
                  {[
                    { n: '1', label: 'Escolha o estilo' },
                    { n: '2', label: 'Digite o tema' },
                    { n: '3', label: 'Gere e publique' },
                  ].map(({ n, label }) => (
                    <div key={n} className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-accent-purple/20 border border-accent-purple/30 text-accent-purple font-bold flex items-center justify-center text-[9px]">{n}</span>
                      {label}
                    </div>
                  ))}
                </div>
              </div>
              ) : (
              /* Slide grid — min 180px = ~40% taller than before */
              <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
                {slides.map((slide, idx) => (
                  <SlideCard
                    key={slide.id}
                    slide={slide} index={idx} isActive={idx === activeSlideIndex} total={slides.length}
                    isOutdated={outdatedSlideIds.has(slide.id)}
                    onClick={() => setActiveSlideIndex(idx)}
                    onDelete={() => handleDeleteSlide(idx)}
                    onRegenerate={() => handleRegenerateSlide(slide.id, slide.title, slide.subtitle, slide.imagePrompt || '')}
                  />
                ))}

                {/* Add slide */}
                {slides.length < 8 && (
                  <button onClick={handleAddSlide}
                    className="aspect-[4/5] rounded-2xl border-2 border-dashed border-dark-border hover:border-accent-purple/50 flex flex-col items-center justify-center gap-2 transition-all text-dark-muted hover:text-accent-purple group">
                    <Plus className="h-6 w-6 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-semibold">{t('newSlide')}</span>
                  </button>
                )}
              </div>
              )}

              {/* Active slide editor — compact, secondary */}
              {activeSlide && (
                <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-dark-border/60 animate-fade-in">
                  <input
                    type="text"
                    value={activeSlide.title}
                    onChange={e => {
                      setSlides(slides.map((s, i) => i === activeSlideIndex ? { ...s, title: e.target.value } : s));
                      if (activeSlide.imageUrl) setOutdatedSlideIds(prev => new Set([...prev, activeSlide.id]));
                    }}
                    className="interactive-input flex-1 py-2 text-sm font-semibold"
                    placeholder={`Título do slide ${activeSlideIndex + 1}`}
                  />
                  <input
                    type="text"
                    value={activeSlide.subtitle}
                    onChange={e => {
                      setSlides(slides.map((s, i) => i === activeSlideIndex ? { ...s, subtitle: e.target.value } : s));
                      if (activeSlide.imageUrl) setOutdatedSlideIds(prev => new Set([...prev, activeSlide.id]));
                    }}
                    className="interactive-input flex-1 py-2 text-sm text-dark-muted"
                    placeholder="Texto de apoio"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Caption + Publish — compact row ── */}
        <div
          className="flex flex-col lg:flex-row gap-3 animate-fade-in"
          style={{ animationDelay: '180ms' }}
        >
          {/* Legenda — flex-1, compact */}
          {isCarousel && (
            <div className="flex-1 glass-panel rounded-2xl border border-dark-border p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-dark-text">{t('caption')}</span>
                <span className="text-[10px] text-dark-muted tabular-nums">{content.length} {t('chars')}</span>
              </div>
              <textarea
                value={content} onChange={e => setContent(e.target.value)}
                className="interactive-input w-full h-16 resize-none py-2 text-[11px] leading-relaxed"
                placeholder={t('captionPlaceholder')}
              />
              <div className="flex gap-2 flex-wrap">
                <button onClick={handleRefineCaption} disabled={isGenerating || !content.trim()}
                  className="btn-press flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-bold text-white bg-gradient-to-r from-accent-purple to-accent-cyan disabled:opacity-50 hover:shadow-[0_0_14px_rgba(139,92,246,0.35)] transition-all">
                  {isGenerating ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />{t('refining')}</> : <><Wand2 className="h-3.5 w-3.5" />{t('refine')}</>}
                </button>
                <button onClick={handleGenerateVariations} disabled={loadingVariations || !slides.length}
                  className="btn-press flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold border border-dark-border text-dark-muted hover:text-accent-cyan hover:border-accent-cyan/30 disabled:opacity-50 transition-all">
                  {loadingVariations ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                  3 versões
                </button>
                <button onClick={handleCopyCaption} disabled={!content.trim()}
                  className="btn-press flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-semibold border border-dark-border text-dark-muted hover:text-dark-text disabled:opacity-50 transition-all">
                  {copied ? <><Check className="h-3.5 w-3.5 text-emerald-400" />{t('copied')}</> : <><Copy className="h-3.5 w-3.5" />{t('copy')}</>}
                </button>
              </div>

              {/* Caption variations modal */}
              {showVariations && (
                <div className="space-y-2 animate-fade-in border-t border-dark-border pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-accent-cyan">3 variações de legenda</span>
                    <button onClick={() => setShowVariations(false)} className="text-dark-muted hover:text-white"><X className="h-3.5 w-3.5" /></button>
                  </div>
                  {loadingVariations && <div className="flex justify-center py-3"><Loader2 className="h-5 w-5 animate-spin text-accent-purple" /></div>}
                  {captionVariations.map((v, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-accent-purple/30 cursor-pointer transition-colors space-y-1"
                      onClick={() => { setContent(v.caption); setShowVariations(false); }}>
                      <span className="text-[9px] font-bold text-accent-purple uppercase tracking-wider">{v.angle}</span>
                      <p className="text-[10px] text-dark-muted leading-relaxed line-clamp-3">{v.caption}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Actions panel */}
          <div className={`${isCarousel ? 'lg:w-64 flex-shrink-0' : 'w-full'} glass-panel rounded-2xl border border-dark-border p-3 flex flex-col gap-2.5`}>

            <p className="text-[11px] font-bold text-dark-text px-0.5">{t('actions')}</p>

            {/* Download all */}
            <button
              onClick={handleDownloadAll}
              disabled={isExportingAll || !readyToPublish}
              className="btn-press w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-bold border border-dark-border text-dark-text hover:border-accent-purple/40 hover:bg-accent-purple/5 disabled:opacity-40 transition-all"
            >
              {isExportingAll
                ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />{t('downloading')}</>
                : <><Download className="h-3.5 w-3.5" />{t('downloadImages')} ({slides.filter(s => s.imageUrl).length}/{slides.length})</>}
            </button>

            {/* Schedule post */}
            {isCarousel && (
              <div className="space-y-2">
                <button onClick={() => setShowSchedule(!showSchedule)} disabled={!readyToPublish}
                  className="btn-press w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-bold border border-dark-border text-dark-text hover:border-accent-cyan/40 hover:bg-accent-cyan/5 disabled:opacity-40 transition-all">
                  <Calendar className="h-3.5 w-3.5 text-accent-cyan" />
                  {scheduleOk ? '✓ Agendado!' : 'Agendar publicação'}
                </button>
                {showSchedule && (
                  <div className="space-y-2 animate-fade-in">
                    <input type="datetime-local" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                      className="interactive-input w-full text-[11px] py-2" />
                    <button onClick={handleSchedulePost} disabled={!scheduleDate || schedulingSave}
                      className="w-full py-2 rounded-xl text-[11px] font-bold text-white bg-gradient-to-r from-accent-cyan to-accent-purple disabled:opacity-50 transition-all">
                      {schedulingSave ? <Loader2 className="h-3.5 w-3.5 animate-spin mx-auto" /> : 'Confirmar agendamento'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Publish to Instagram */}
            <button
              onClick={handlePublishToInstagram}
              disabled={publishState === 'publishing' || !readyToPublish}
              className={`btn-press w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-bold text-white transition-all disabled:opacity-40 ${
                publishState === 'success'
                  ? 'bg-emerald-500 shadow-[0_0_14px_rgba(16,185,129,0.4)]'
                  : publishState === 'error'
                  ? 'bg-red-500/80'
                  : 'bg-gradient-to-r from-accent-purple to-accent-cyan shadow-[0_0_14px_rgba(139,92,246,0.25)] hover:shadow-[0_0_24px_rgba(139,92,246,0.5)] disabled:shadow-none'
              }`}
            >
              {publishState === 'publishing' && <><Loader2 className="h-3.5 w-3.5 animate-spin" />{t('publishing')}</>}
              {publishState === 'success'    && <><Check className="h-3.5 w-3.5" />{t('published')}</>}
              {publishState === 'error'      && <><X className="h-3.5 w-3.5" />{t('failed')}</>}
              {publishState === 'idle'       && <><Send className="h-3.5 w-3.5" />{t('postToInstagram')}</>}
            </button>

            {/* Feedback messages */}
            {publishState === 'error' && publishError && (
              <p className="text-[10px] text-red-400 leading-snug animate-fade-in px-0.5">
                {publishError}
              </p>
            )}
            {publishState === 'success' && publishPermalink && (
              <a
                href={publishPermalink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold animate-fade-in px-0.5 transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                {t('viewOnInstagram')}
              </a>
            )}
            {!readyToPublish && publishState === 'idle' && (
              <p className="text-[10px] text-dark-muted px-0.5">
                {t('awaitImages')}
              </p>
            )}
          </div>
        </div>

      </div>

      {/* ── Upgrade modal ── */}
      {upgradeModalOpen && (() => {
        const isNoSub = !upgradeReason || upgradeReason === 'subscription_required';
        const used    = subscription?.carousels_used ?? 0;
        const limit   = subscription?.carousel_limit ?? 0;

        const handleCheckout = async (plan: string) => {
          setUpgradeModalOpen(false);
          const res = await fetch('/api/stripe/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ plan }),
          });
          if (res.ok) {
            const { url } = await res.json();
            if (url) window.location.href = url;
          }
        };

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setUpgradeModalOpen(false)} />
            <div className="relative glass-panel rounded-3xl border border-dark-border p-6 w-full max-w-sm space-y-5 shadow-2xl animate-fade-in">
              <button onClick={() => setUpgradeModalOpen(false)} className="absolute top-4 right-4 text-dark-muted hover:text-dark-text transition-colors">
                <X className="h-5 w-5" />
              </button>

              {/* Header */}
              <div className="space-y-1">
                <p className="text-xs font-semibold text-accent-purple uppercase tracking-wider">
                  {isNoSub ? 'Plano necessário' : 'Limite atingido'}
                </p>
                <h2 className="text-xl font-bold text-dark-text leading-tight">
                  {isNoSub
                    ? 'Escolha um plano para continuar'
                    : 'Você usou todos os carrosséis do mês'}
                </h2>
                <p className="text-sm text-dark-muted leading-relaxed pt-1">
                  {isNoSub
                    ? 'Para gerar carrosséis com IA você precisa de uma assinatura ativa.'
                    : `Você gerou ${used} de ${limit} carrosséis este mês. Faça upgrade para continuar criando.`}
                </p>
              </div>

              {/* Plans */}
              <div className="space-y-3">
                {/* Pro */}
                <div className="rounded-2xl border border-accent-purple/40 bg-accent-purple/10 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-white">Plano Pro</p>
                    <p className="text-xs font-bold text-accent-cyan">R$29,99/mês</p>
                  </div>
                  {['25 carrosséis por mês', 'Imagens geradas por IA', 'Publicação direta no Instagram', 'Analytics + Calendário'].map(f => (
                    <div key={f} className="flex items-center gap-2 text-xs text-dark-muted">
                      <Check className="h-3 w-3 text-accent-purple flex-shrink-0" />
                      {f}
                    </div>
                  ))}
                  <button
                    onClick={() => handleCheckout('pro')}
                    className="btn-press w-full mt-2 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-accent-purple to-accent-cyan hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all"
                  >
                    Assinar Pro
                  </button>
                </div>

                {/* Agency */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-white">Plano Agency</p>
                    <p className="text-xs font-bold text-dark-muted">R$79,99/mês</p>
                  </div>
                  {['60 carrosséis por mês', 'Tudo do Pro', 'Multi Brand Kits', 'Exportação Figma/PDF'].map(f => (
                    <div key={f} className="flex items-center gap-2 text-xs text-dark-muted">
                      <Check className="h-3 w-3 text-dark-muted flex-shrink-0" />
                      {f}
                    </div>
                  ))}
                  <button
                    onClick={() => handleCheckout('agency')}
                    className="btn-press w-full mt-2 py-2.5 rounded-xl text-xs font-bold border border-white/10 text-dark-muted hover:text-white hover:border-white/20 transition-all"
                  >
                    Assinar Agency
                  </button>
                </div>
              </div>

              <button onClick={() => setUpgradeModalOpen(false)} className="w-full text-[10px] text-dark-muted hover:text-dark-text transition-colors">
                Fechar
              </button>
            </div>
          </div>
        );
      })()}
    </>
  );
}

// Wrap in Suspense so useSearchParams works in Next.js App Router
import { Suspense } from 'react';
const DashboardPageWithSuspense = () => (
  <Suspense fallback={null}>
    <DashboardPage />
  </Suspense>
);
export { DashboardPageWithSuspense as default };
