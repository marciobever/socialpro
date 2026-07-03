"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import { Linkedin, Instagram, Facebook, Pinterest } from '@/components/icons';
import type { PlatformType, Slide, CarouselStyleModel } from '@/types';
import {
  Zap, Check, Send, AlertTriangle, Info, Plus, Sliders, RefreshCw, Download, Clock, ChevronLeft
} from 'lucide-react';
import { toast } from '@/components/Toast';
import { Modal, ConfirmDialog } from '@/components/Modal';
import { GenerateWizard } from '@/components/GenerateWizard';
import { CreationFlow } from '@/components/dashboard/CreationFlow';
import { CarouselWorkspace } from '@/components/dashboard/CarouselWorkspace';
import { PreviewPanel } from '@/components/dashboard/PreviewPanel';
import { PublishPanel } from '@/components/dashboard/PublishPanel';
import { CarouselCard } from '@/components/cards/CarouselCard';
import { TextPostCard } from '@/components/cards/TextPostCard';

const ease = [0.16, 1, 0.3, 1] as const;
const spring = { type: 'spring' as const, stiffness: 400, damping: 28 };

// Style picker configurations for Instagram style models
const PHOTO_STYLES_9: { id: CarouselStyleModel; name: string; swatch: string }[] = [
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

const AVATAR_STYLES_SUB: { id: CarouselStyleModel; name: string; swatch: string }[] = [
  { id: 'infantil', name: 'Infantil', swatch: 'linear-gradient(135deg,#fb923c,#facc15,#4ade80)' },
  { id: 'pixar',    name: '3D Pixar', swatch: 'linear-gradient(135deg,#60a5fa,#a78bfa,#f472b6)' },
  { id: 'anime',    name: 'Anime',    swatch: 'linear-gradient(135deg,#f472b6,#fb923c,#facc15)' },
  { id: 'flat',     name: 'Flat Art', swatch: 'linear-gradient(135deg,#10b981,#3b82f6,#8b5cf6)' },
  { id: 'cartoon',  name: 'Cartoon',  swatch: 'linear-gradient(135deg,#ef4444,#f97316,#facc15)' },
];
const AVATAR_IDS_SUB = AVATAR_STYLES_SUB.map(s => s.id);

const STYLE_DESC: Record<string, string> = {
  lifestyle:  'Fotografia real, tom quente e aspiracional',
  tech:       'Futurista, neon e grid cibernético',
  alert:      'Urgência e impacto, vermelho/âmbar',
  minimalist: 'Limpo, escuro e elegante',
  feminino:   'Suave, rosado e delicado',
  neutro:     'Bege sóbrio e atemporal',
  retro:      'Vintage âmbar, vibe anos 80',
  aquarela:   'Pintura suave em tons pastel',
  neon:       'Brilho vibrante e estética cibernética neon',
  infantil:   'Avatar ilustrado e lúdico',
  pixar:      'Avatar 3D estilo animação',
  anime:      'Avatar estilo mangá/anime',
  flat:       'Avatar flat art geométrico',
  cartoon:    'Avatar cartoon expressivo',
};

function StyleChip({ name, swatch, active, disabled, onClick, title }: {
  id: CarouselStyleModel; name: string; swatch: string;
  active: boolean; disabled: boolean; onClick: () => void; title?: string;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      whileTap={{ scale: 0.95 }}
      transition={spring}
      className={`group relative flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-[11px] font-semibold border transition-all disabled:opacity-50 cursor-pointer ${
        active
          ? 'border-accent-purple/60 bg-accent-purple/[0.14] text-white shadow-[0_0_0_1px_rgba(139,92,246,0.3),0_0_14px_rgba(139,92,246,0.18)]'
          : 'border-white/[0.07] bg-white/[0.03] text-white/45 hover:text-white/85 hover:border-white/[0.16] hover:bg-white/[0.05]'
      }`}
    >
      <span
        className={`w-3 h-3 rounded-md flex-shrink-0 transition-transform group-hover:scale-110 ${active ? 'ring-1 ring-white/40' : ''}`}
        style={{ background: swatch }}
      />
      <span className="truncate">{name}</span>
    </motion.button>
  );
}

function StylePicker({ styleModel, onSelect, disabled }: {
  styleModel: CarouselStyleModel;
  onSelect: (s: CarouselStyleModel) => void;
  disabled: boolean;
}) {
  const tStyles = useTranslations('styles');
  const t = useTranslations('dashboard');
  const [open, setOpen] = React.useState(true);
  const isAvatar = AVATAR_IDS_SUB.includes(styleModel);

  const activeStyle =
    PHOTO_STYLES_9.find(s => s.id === styleModel) ??
    AVATAR_STYLES_SUB.find(s => s.id === styleModel) ??
    PHOTO_STYLES_9[0];

  return (
    <div className="rounded-3xl border border-dark-border bg-dark-panel overflow-hidden flex-shrink-0">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-6 h-6 rounded-lg flex-shrink-0 ring-1 ring-white/15" style={{ background: activeStyle.swatch }} />
          <div className="text-left leading-tight min-w-0">
            <span className="text-[11px] font-bold text-white/65 uppercase tracking-[0.14em] block">{t('styleLabel')}</span>
            <span className="text-[11px] text-white/85 font-semibold truncate block">{tStyles(activeStyle.id as Parameters<typeof tStyles>[0])}</span>
          </div>
        </div>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-white/30 text-[10px] flex-shrink-0"
        >▼</motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease }}
            className="overflow-hidden"
          >
            <div className="p-3 space-y-3 border-t border-white/[0.06]">
              <div className="grid grid-cols-3 gap-2">
                {PHOTO_STYLES_9.map(s => (
                  <StyleChip
                    key={s.id}
                    {...s}
                    name={tStyles(s.id as Parameters<typeof tStyles>[0])}
                    title={tStyles(`${s.id}_desc` as any)}
                    active={styleModel === s.id}
                    disabled={disabled}
                    onClick={() => onSelect(s.id)}
                  />
                ))}
                <StyleChip
                  id="infantil"
                  name={t('avatarLabel')}
                  swatch="linear-gradient(135deg,#fb923c,#facc15,#4ade80)"
                  title={tStyles('infantil_desc')}
                  active={isAvatar}
                  disabled={disabled}
                  onClick={() => onSelect(isAvatar ? 'lifestyle' : 'infantil')}
                />
              </div>

              <AnimatePresence>
                {isAvatar && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2, ease }}
                    className="overflow-hidden"
                  >
                    <div className="pt-2 border-t border-white/[0.06]">
                      <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mb-2 px-0.5">{t('drawingStyleLabel')}</p>
                      <div className="grid grid-cols-3 gap-2">
                        {AVATAR_STYLES_SUB.map(s => (
                          <StyleChip
                            key={s.id}
                            {...s}
                            name={tStyles(s.id as Parameters<typeof tStyles>[0])}
                            title={tStyles(`${s.id}_desc` as any)}
                            active={styleModel === s.id}
                            disabled={disabled}
                            onClick={() => onSelect(s.id)}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-start gap-2 px-2.5 py-2 rounded-xl bg-accent-purple/[0.05] border border-accent-purple/[0.12]">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-purple flex-shrink-0 mt-1" />
                <p className="text-[10px] text-white/55 leading-relaxed">
                  {tStyles(`${styleModel}_desc` as any)}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const FORMATS = [
  { id: 'instagram' as const, label: 'Instagram',  icon: Instagram, color: 'text-pink-400'  },
  { id: 'facebook' as const,  label: 'Facebook',   icon: Facebook,  color: 'text-blue-500'  },
  { id: 'linkedin' as const,  label: 'LinkedIn',   icon: Linkedin,  color: 'text-blue-400'  },
  { id: 'pinterest' as const, label: 'Pinterest',  icon: Pinterest, color: 'text-red-500'   },
];

function PublishModal({ platform, open, onClose }: { platform: PlatformType; open: boolean; onClose: () => void }) {
  const label = FORMATS.find(f => f.id === platform)?.label ?? platform;
  const tPub = useTranslations('publish');
  const publishSteps = [tPub('connect'), tPub('configure'), tPub('authorize')];
  return (
    <Modal
      open={open}
      onClose={onClose}
      icon={<Send className="h-5 w-5" />}
      title={`${tPub('title')} ${label}`}
      description={tPub('subtitle')}
      footer={
        <button onClick={onClose} className="w-full py-2.5 rounded-xl text-[13px] font-bold text-white bg-gradient-to-r from-accent-purple to-accent-cyan cursor-pointer">
          {tPub('understood')}
        </button>
      }
    >
      <div className="space-y-2">
        {publishSteps.map((s, i) => (
          <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <span className="h-5 w-5 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
              <Clock className="h-3 w-3 text-amber-400" />
            </span>
            <span className="text-[12px] text-white/55">{s}</span>
          </div>
        ))}
        <div className="p-3 rounded-xl bg-accent-cyan/5 border border-accent-cyan/15 flex gap-2 mt-1">
          <Info className="h-3.5 w-3.5 text-accent-cyan flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-white/55 leading-relaxed">{tPub('comingSoon')}</p>
        </div>
      </div>
    </Modal>
  );
}

function DashboardPage() {
  const searchParams = useSearchParams();
  const t = useTranslations('dashboard');
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
    handleGenerateCarousel, handleRegenerateSlideImage,
    handleRefineCaption, handleGenerateTextPost,
    subscription,
    upgradeModalOpen, setUpgradeModalOpen, upgradeReason,
    xPostFormat, setXPostFormat,
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
          const loadedPlatform = carousel.platform || 'instagram';
          setPlatform(loadedPlatform);
          if (loadedPlatform === 'x') {
            setXPostFormat(dbSlides.length === 1 ? 'image' : 'text');
          }
        }
      })
      .catch(console.error);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (!['infantil', 'pixar', 'anime', 'flat', 'cartoon'].includes(styleModel) && referenceImage) {
      setReferenceImage(null);
    }
  }, [styleModel, referenceImage, setReferenceImage]);

  const [showPublish, setShowPublish] = React.useState(false);
  const [confirmDeleteIndex, setConfirmDeleteIndex] = React.useState<number | null>(null);
  const [wizardOpen, setWizardOpen] = React.useState(false);
  const [confirmRedoOpen, setConfirmRedoOpen] = React.useState(false);
  const [confirmNewPostOpen, setConfirmNewPostOpen] = React.useState(false);

  const isCarousel = platform === 'instagram' || platform === 'linkedin' || (platform === 'x' && xPostFormat === 'image');
  const showWorkspace = (isCarousel && (slides.length > 0 || isGeneratingCarousel)) ||
                        (!isCarousel && (content.trim().length > 0 || isGenerating));

  const handleDeleteSlide = (index: number) => {
    if (slides.length <= 1) return;
    const updated = slides.filter((_, i) => i !== index);
    setSlides(updated);
    setCarouselSlideCount(updated.length);
    if (activeSlideIndex >= updated.length) setActiveSlideIndex(updated.length - 1);
  };

  return (
    <>
      <GenerateWizard open={wizardOpen} onClose={() => setWizardOpen(false)} />
      <PublishModal platform={platform} open={showPublish} onClose={() => setShowPublish(false)} />

      <div className="flex flex-col gap-3 py-3 lg:h-[calc(100dvh-92px)] lg:overflow-hidden">
        {showWorkspace ? (
          <div className="flex-1 flex flex-col min-h-0 w-full max-w-6xl mx-auto px-4">
            {/* Top Bar for Step 3 */}
            <div className="flex items-center justify-between mb-3.5 flex-shrink-0 w-full">
              <button
                onClick={() => setConfirmNewPostOpen(true)}
                className="flex items-center gap-1.5 text-xs font-semibold text-white/45 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" /> {t('newPost')}
              </button>
              <span className="text-[10px] font-bold uppercase px-3 py-1 rounded-full border bg-accent-cyan/[0.07] border-accent-cyan/15 text-accent-cyan tracking-wider">
                {t('step3of3')}
              </span>
            </div>

            {isCarousel ? (
              <div className="flex-1 grid gap-5 min-h-0 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_350px]">
                {/* Column 1: CarouselWorkspace */}
                <CarouselWorkspace
                  onOpenWizard={() => setWizardOpen(true)}
                  onOpenConfirmRedo={() => setConfirmRedoOpen(true)}
                  onOpenConfirmNewPost={() => setConfirmNewPostOpen(true)}
                  onConfirmDeleteIndex={(idx) => setConfirmDeleteIndex(idx)}
                />

                {/* Column 2: PreviewPanel & PublishPanel */}
                <div className="flex flex-col gap-4 min-h-0 lg:overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                  <PreviewPanel />
                  <PublishPanel
                    onOpenPublishModal={() => setShowPublish(true)}
                    onOpenConfirmNewPost={() => setConfirmNewPostOpen(true)}
                  />
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col gap-5 min-h-0 max-w-2xl mx-auto w-full lg:overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                {/* TextPostCard */}
                <div className="flex-shrink-0">
                  <TextPostCard
                    platform={platform} topic={carouselTopic} onUpdateTopic={setCarouselTopic}
                    tone={tone} onUpdateTone={setTone} content={content} onUpdateContent={setContent}
                    isGenerating={isGenerating} onGenerate={handleGenerateTextPost} onRefine={handleRefineCaption}
                    hideGenerator={true}
                  />
                </div>

                <PreviewPanel />
                <PublishPanel
                  onOpenPublishModal={() => setShowPublish(true)}
                  onOpenConfirmNewPost={() => setConfirmNewPostOpen(true)}
                />
              </div>
            )}
          </div>
        ) : (
          <CreationFlow />
        )}
      </div>

      {/* Upgrade modal */}
      {(() => {
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
          <Modal
            open={upgradeModalOpen}
            onClose={() => setUpgradeModalOpen(false)}
            size="sm"
            icon={<Zap className="h-5 w-5" />}
            title={isNoSub ? t('upgradeTitleNoSub') : t('upgradeTitleLimit')}
            description={isNoSub
              ? t('upgradeDescNoSub')
              : t('upgradeDescLimit', { used, limit })}
          >
            <div className="space-y-3">
              {/* Pro */}
              <div className="rounded-2xl border border-accent-purple/40 bg-accent-purple/10 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[13px] font-bold text-white">{t('planPro')}</p>
                  <p className="text-[13px] font-bold text-accent-cyan">{t('pricePro')}</p>
                </div>
                {[t('proFeature1'), t('proFeature2'), t('proFeature3'), t('proFeature4')].map(f => (
                  <div key={f} className="flex items-center gap-2 text-[12px] text-white/55">
                    <Check className="h-3 w-3 text-accent-purple flex-shrink-0" />
                    {f}
                  </div>
                ))}
                <button
                  onClick={() => handleCheckout('pro')}
                  className="btn-press w-full mt-2 py-2.5 rounded-xl text-[13px] font-bold text-white bg-gradient-to-r from-accent-purple to-accent-cyan hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all cursor-pointer"
                >
                  {t('btnSubscribePro')}
                </button>
              </div>

              {/* Agency */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[13px] font-bold text-white">{t('planAgency')}</p>
                  <p className="text-[13px] font-bold text-white/40">{t('priceAgency')}</p>
                </div>
                {[t('agencyFeature1'), t('agencyFeature2'), t('agencyFeature3'), t('agencyFeature4')].map(f => (
                  <div key={f} className="flex items-center gap-2 text-[12px] text-white/55">
                    <Check className="h-3 w-3 text-white/40 flex-shrink-0" />
                    {f}
                  </div>
                ))}
                <button
                  onClick={() => handleCheckout('agency')}
                  className="btn-press w-full mt-2 py-2.5 rounded-xl text-[12px] font-bold border border-white/10 text-white/55 hover:text-white hover:border-white/20 transition-all cursor-pointer"
                >
                  {t('btnSubscribeAgency')}
                </button>
              </div>
            </div>
          </Modal>
        );
      })()}

      {/* Confirmação de exclusão de slide */}
      <ConfirmDialog
        open={confirmDeleteIndex !== null}
        onClose={() => setConfirmDeleteIndex(null)}
        onConfirm={() => { if (confirmDeleteIndex !== null) { handleDeleteSlide(confirmDeleteIndex); toast.success(t('toastSlideDeleted')); } }}
        title={t('confirmDeleteTitle')}
        description={t('confirmDeleteDesc')}
        confirmLabel={t('confirmDeleteLabel')}
        cancelLabel={t('cancelLabel')}
        danger
      />

      {/* Confirmação de refazer carrossel */}
      <ConfirmDialog
        open={confirmRedoOpen}
        onClose={() => setConfirmRedoOpen(false)}
        onConfirm={() => {
          setConfirmRedoOpen(false);
          handleGenerateCarousel();
          toast.info(t('toastRegeneratingCarousel'));
        }}
        title={t('confirmRedoTitle')}
        description={t('confirmRedoDesc')}
        confirmLabel={t('confirmRedoLabel')}
        cancelLabel={t('cancelLabel')}
        danger
      />

      {/* Confirmação de novo post */}
      <ConfirmDialog
        open={confirmNewPostOpen}
        onClose={() => setConfirmNewPostOpen(false)}
        onConfirm={() => {
          setConfirmNewPostOpen(false);
          setSlides([]);
          setContent('');
          setCarouselTopic('');
          setReferenceImage(null);
          toast.success(t('toastNewPostStarted'));
        }}
        title={t('confirmNewPostTitle')}
        description={t('confirmNewPostDesc')}
        confirmLabel={t('confirmNewPostLabel')}
        cancelLabel={t('cancelLabel')}
        danger
      />
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
