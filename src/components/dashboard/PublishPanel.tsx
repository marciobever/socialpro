"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { useAppContext } from '@/context/AppContext';
import {
  Send, Clock, Info, Check, Loader2, Wand2, Sparkles, ChevronDown, Copy, Calendar, X, ExternalLink, Plus
} from 'lucide-react';
import { toast } from '@/components/Toast';

const ease = [0.16, 1, 0.3, 1] as const;
const spring = { type: 'spring' as const, stiffness: 400, damping: 28 };

interface PanelHeaderProps {
  label: string;
  icon?: React.ReactNode;
  accent?: string;
  children?: React.ReactNode;
}

const PanelHeader = React.memo(function PanelHeader({
  icon, label, accent = 'text-white/45', children,
}: PanelHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] flex-shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        {icon && <span className={`flex-shrink-0 ${accent}`}>{icon}</span>}
        <span className="text-[11px] font-bold text-white/55 uppercase tracking-[0.14em] truncate">{label}</span>
      </div>
      {children && <div className="flex items-center gap-2 flex-shrink-0">{children}</div>}
    </div>
  );
});

function ContextAlert({ tone = 'info', children }: { tone?: 'info' | 'warn' | 'ok'; children: React.ReactNode }) {
  const styles = {
    info: 'border-accent-cyan/20 bg-accent-cyan/[0.05] text-white/55',
    warn: 'border-amber-500/25 bg-amber-500/[0.06] text-amber-200/80',
    ok:   'border-emerald-500/25 bg-emerald-500/[0.06] text-emerald-300/80',
  }[tone];
  const Icon = tone === 'warn' ? X : tone === 'ok' ? Check : Info;
  const iconColor = tone === 'warn' ? 'text-amber-400' : tone === 'ok' ? 'text-emerald-400' : 'text-accent-cyan';
  return (
    <div className={`flex items-start gap-2 px-3 py-2 rounded-xl border ${styles}`}>
      <Icon className={`h-3.5 w-3.5 flex-shrink-0 mt-0.5 ${iconColor}`} />
      <p className="text-[10.5px] leading-relaxed">{children}</p>
    </div>
  );
}

interface PublishPanelProps {
  onOpenPublishModal: () => void;
  onOpenConfirmNewPost: () => void;
}

export function PublishPanel({
  onOpenPublishModal,
  onOpenConfirmNewPost,
}: PublishPanelProps) {
  const t = useTranslations('dashboard');
  const tPublish = useTranslations('publish');
  const locale = useLocale();
  
  const {
    platform,
    tone,
    content,
    setContent,
    slides,
    brandKit,
    carouselTopic,
    isGenerating,
    setIsGenerating,
  } = useAppContext();

  const isCarousel = platform === 'instagram';

  const [copied, setCopied] = React.useState(false);
  const [isRefining, setIsRefining] = React.useState(false);
  const [showRefineMenu, setShowRefineMenu] = React.useState(false);
  const [captionVariations, setCaptionVariations] = React.useState<{angle: string; caption: string}[]>([]);
  const [loadingVariations, setLoadingVariations] = React.useState(false);
  const [showVariations, setShowVariations] = React.useState(false);

  // Schedule
  const [showSchedule, setShowSchedule] = React.useState(false);
  const [scheduleDate, setScheduleDate] = React.useState('');
  const [schedulingSave, setSchedulingSave] = React.useState(false);
  const [scheduleOk, setScheduleOk] = React.useState(false);

  // Publish state
  type PublishState = 'idle' | 'publishing' | 'success' | 'error';
  const [publishState, setPublishState] = React.useState<PublishState>('idle');
  const [publishError, setPublishError] = React.useState('');
  const [publishPermalink, setPublishPermalink] = React.useState('');

  const readyToPublish = isCarousel ? slides.some(s => s.imageUrl) : content.trim().length > 0;
  const publishLabel = platform === 'linkedin' ? `${tPublish('title')} LinkedIn` : platform === 'x' ? `${tPublish('title')} X` : t('postToInstagram');
  const publishViewLabel = platform === 'x' ? t('viewOnX') : platform === 'linkedin' ? t('viewOnLinkedIn') : t('viewOnInstagram');
  const imagesReady = slides.filter(s => s.imageUrl).length;
  const missingImages = isCarousel ? Math.max(slides.length - imagesReady, 0) : 0;

  const REFINE_PRESETS = [
    { label: t('presetPersuasive'), instruction: t('presetPersuasiveDesc') },
    { label: t('presetShorter'),      instruction: t('presetShorterDesc') },
    { label: t('presetEmotional'),  instruction: t('presetEmotionalDesc') },
    { label: t('presetAuthority'), instruction: t('presetAuthorityDesc') },
  ];

  const runRefine = async (instruction?: string) => {
    if (!content.trim() || isRefining) return;
    setShowRefineMenu(false);
    setIsRefining(true);
    const tid = toast.loading(instruction ? t('refiningCaption') : t('refiningAI'), instruction);
    try {
      const res = await fetch('/api/ai/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, tone, aiBio: brandKit.aiBio, instruction }),
      });
      toast.dismiss(tid);
      if (!res.ok) throw new Error('falha');
      const data = await res.json();
      if (data?.refinedText) {
        setContent(data.refinedText);
        toast.success(t('captionRefined'), instruction ? undefined : t('captionRefinedDesc'));
      } else {
        throw new Error('vazio');
      }
    } catch {
      toast.dismiss(tid);
      toast.error(t('refineError'), t('tryAgainLater'));
    } finally {
      setIsRefining(false);
    }
  };

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
      if (res.ok) {
        const { variations } = await res.json();
        setCaptionVariations(variations ?? []);
        toast.success(t('variationsGenerated'), t('chooseVariation'));
      } else { throw new Error('falha'); }
    } catch { toast.error(t('errorGeneratingVariations')); }
    finally { setLoadingVariations(false); }
  };

  const handleSchedulePost = async () => {
    if (!scheduleDate) return;
    setSchedulingSave(true);
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const carouselId = urlParams.get('load');
      const res = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carouselId, caption: content, scheduledFor: new Date(scheduleDate).toISOString() }),
      });
      if (res.ok) {
        setScheduleOk(true);
        toast.success(t('scheduledToast'), new Date(scheduleDate).toLocaleString(locale, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }));
        setTimeout(() => { setScheduleOk(false); setShowSchedule(false); }, 2000);
      } else { throw new Error('falha'); }
    } catch { toast.error(t('scheduleError'), t('checkDateError')); }
    finally { setSchedulingSave(false); }
  };

  const handleCopyCaption = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success(t('copied'));
      setTimeout(() => setCopied(false), 1800);
    } catch { toast.error(t('copyError')); }
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
      toast.success('Publicado no Instagram', 'Seu carrossel já está no ar 🎉');
      setTimeout(() => { setPublishState('idle'); setPublishPermalink(''); }, 8000);
    } catch (err) {
      setPublishState('error');
      setPublishError(err instanceof Error ? err.message : 'Erro desconhecido.');
      toast.error('Falha ao publicar', err instanceof Error ? err.message : undefined);
      setTimeout(() => setPublishState('idle'), 6000);
    }
  };

  const handlePublishToLinkedIn = async () => {
    if (publishState === 'publishing') return;
    setPublishState('publishing');
    setPublishError('');
    setPublishPermalink('');
    try {
      const res = await fetch('/api/linkedin/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: content }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? 'Erro ao publicar.');
      setPublishState('success');
      toast.success('Publicado no LinkedIn', 'Seu post já está no ar 🎉');
      setTimeout(() => setPublishState('idle'), 8000);
    } catch (err) {
      setPublishState('error');
      setPublishError(err instanceof Error ? err.message : 'Erro desconhecido.');
      toast.error('Falha ao publicar', err instanceof Error ? err.message : undefined);
      setTimeout(() => setPublishState('idle'), 6000);
    }
  };

  const handlePublishToX = async () => {
    if (publishState === 'publishing') return;
    setPublishState('publishing');
    setPublishError('');
    setPublishPermalink('');
    try {
      const res = await fetch('/api/twitter/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: content }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? 'Erro ao publicar.');
      setPublishState('success');
      if (data.permalink) setPublishPermalink(data.permalink);
      toast.success('Publicado no X', 'Seu tweet já está no ar 🎉');
      setTimeout(() => { setPublishState('idle'); setPublishPermalink(''); }, 8000);
    } catch (err) {
      setPublishState('error');
      setPublishError(err instanceof Error ? err.message : 'Erro desconhecido.');
      toast.error('Falha ao publicar', err instanceof Error ? err.message : undefined);
      setTimeout(() => setPublishState('idle'), 6000);
    }
  };

  const handlePublish = platform === 'linkedin' ? handlePublishToLinkedIn
    : platform === 'x' ? handlePublishToX
    : handlePublishToInstagram;

  return (
    <div className="flex flex-col gap-3 min-h-0">
      {isCarousel ? (
        <>
          {/* Legenda do post */}
          <div className="rounded-3xl border border-white/[0.07] relative flex-shrink-0" style={{ background: '#181b25' }}>
            <PanelHeader label={t('caption')}>
              <span className={`text-[10px] tabular-nums ${content.length > 2200 ? 'text-amber-400' : 'text-white/30'}`}>{content.length} / 2.200</span>
            </PanelHeader>
            <div className="p-3 space-y-3">
              <div className="rounded-2xl border border-white/[0.06] bg-black/20 focus-within:border-accent-purple/30 transition-colors p-3">
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="w-full h-20 bg-transparent outline-none resize-none text-[13px] text-white/80 leading-relaxed placeholder:text-white/20 font-normal"
                  placeholder={t('captionPlaceholder')}
                />
              </div>

              <div className="flex flex-col gap-2">
                {/* Refinar */}
                <div className="relative flex gap-2">
                  <motion.button onClick={() => runRefine()} disabled={isRefining || !content.trim()}
                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }} transition={spring}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-bold text-white bg-gradient-to-r from-accent-purple to-accent-cyan disabled:opacity-40 shadow-[0_4px_16px_rgba(139,92,246,0.25)] hover:shadow-[0_6px_24px_rgba(139,92,246,0.45)] transition-shadow cursor-pointer">
                    {isRefining ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />{t('refining')}</> : <><Wand2 className="h-3.5 w-3.5" />{t('refine')}</>}
                  </motion.button>
                  <button onClick={() => setShowRefineMenu(v => !v)} disabled={isRefining || !content.trim()}
                    title={t('refine')}
                    className="px-2.5 rounded-xl border border-accent-purple/30 bg-accent-purple/[0.08] text-white/70 hover:text-white hover:bg-accent-purple/[0.16] disabled:opacity-40 transition-colors cursor-pointer">
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showRefineMenu ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {showRefineMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.97 }}
                        transition={{ duration: 0.16, ease }}
                        className="absolute top-full right-0 mt-2 w-52 z-30 rounded-2xl border border-white/[0.10] p-1.5 shadow-[0_20px_48px_-12px_rgba(0,0,0,0.8)] glass-panel-heavy"
                      >
                        <p className="text-[9px] font-bold text-white/35 uppercase tracking-widest px-2.5 py-1.5">{t('refineAs')}</p>
                        {REFINE_PRESETS.map(p => (
                          <button key={p.label} onClick={() => runRefine(p.instruction)}
                            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-[12px] font-semibold text-white/65 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer text-left">
                            <Sparkles className="h-3 w-3 text-accent-purple flex-shrink-0" />{p.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Versões + copiar */}
                <div className="grid grid-cols-2 gap-2">
                  <motion.button onClick={handleGenerateVariations} disabled={loadingVariations || !slides.length}
                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }} transition={spring}
                    title="Gera 3 ângulos diferentes da legenda"
                    className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-semibold border border-white/[0.08] text-white/45 hover:text-accent-cyan hover:border-accent-cyan/30 disabled:opacity-40 transition-colors cursor-pointer">
                    {loadingVariations ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                    3 versões
                  </motion.button>
                  <motion.button onClick={handleCopyCaption} disabled={!content.trim()}
                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }} transition={spring}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-semibold border transition-colors disabled:opacity-40 cursor-pointer ${
                      copied ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400' : 'border-white/[0.08] text-white/45 hover:text-white hover:border-white/[0.15]'
                    }`}>
                    {copied ? <><Check className="h-3.5 w-3.5" />{t('copied')}</> : <><Copy className="h-3.5 w-3.5" />{t('copy')}</>}
                  </motion.button>
                </div>
              </div>

              <AnimatePresence>
                {showVariations && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.22, ease }} className="space-y-2 overflow-hidden font-sans">
                    <div className="flex items-center justify-between pt-2 border-t border-white/[0.05]">
                      <span className="text-[10px] font-bold text-accent-cyan flex items-center gap-1.5"><Sparkles className="h-3 w-3" />{t('chooseAVersion')}</span>
                      <button onClick={() => setShowVariations(false)} className="text-white/30 hover:text-white transition-colors"><X className="h-3.5 w-3.5" /></button>
                    </div>
                    {loadingVariations && <div className="flex justify-center py-3"><Loader2 className="h-5 w-5 animate-spin text-accent-purple" /></div>}
                    {captionVariations.map((v, i) => (
                      <motion.button key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, ease }}
                        className="w-full text-left p-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-accent-purple/40 hover:bg-accent-purple/[0.04] cursor-pointer transition-colors space-y-0.5 group/var"
                        onClick={() => { setContent(v.caption); setShowVariations(false); toast.success(t('variationApplied')); }}>
                        <span className="text-[9px] font-bold text-accent-purple uppercase tracking-wider flex items-center justify-between">
                          {v.angle}
                          <span className="text-[8px] text-white/30 opacity-0 group-hover/var:opacity-100 transition-opacity">{t('apply')} →</span>
                        </span>
                        <p className="text-[11px] text-white/45 leading-relaxed line-clamp-3">{v.caption}</p>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Publicar — Instagram */}
          <div className="rounded-3xl border border-white/[0.07] overflow-hidden flex-shrink-0" style={{ background: '#181b25' }}>
            <PanelHeader icon={<Send className="h-3.5 w-3.5" />} accent="text-accent-cyan" label={tPublish('title')} />
            <div className="p-3 space-y-2.5">
              {slides.length === 0 && (
                <ContextAlert tone="info">{t('generateCarouselToPublish')}</ContextAlert>
              )}
              {slides.length > 0 && missingImages > 0 && (
                <ContextAlert tone="warn">
                  {t('missingImagesAlert', { count: missingImages, slideText: missingImages === 1 ? t('slide_singular') : t('slide_plural') })}
                </ContextAlert>
              )}
              {readyToPublish && publishState === 'idle' && (
                <ContextAlert tone="ok">{t('readyToPublishAndSchedule')}</ContextAlert>
              )}

              <motion.button onClick={() => setShowSchedule(!showSchedule)} disabled={!readyToPublish}
                whileHover={readyToPublish ? { scale: 1.01 } : undefined} whileTap={readyToPublish ? { scale: 0.98 } : undefined} transition={spring}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl text-[12px] font-semibold border border-white/[0.08] text-white/55 hover:text-accent-cyan hover:border-accent-cyan/30 disabled:opacity-35 disabled:cursor-not-allowed transition-colors cursor-pointer">
                <Calendar className="h-3.5 w-3.5 text-accent-cyan" />
                {scheduleOk ? t('scheduledOk') : t('schedulePost')}
              </motion.button>

              <AnimatePresence>
                {showSchedule && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2, ease }} className="space-y-2 overflow-hidden">
                    <input type="datetime-local" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-[12px] text-white outline-none focus:border-accent-cyan/50 transition-all" />
                    <button onClick={handleSchedulePost} disabled={!scheduleDate || schedulingSave}
                      className="w-full py-2 rounded-xl text-[12px] font-bold text-white bg-gradient-to-r from-accent-cyan to-accent-purple disabled:opacity-40 cursor-pointer">
                      {schedulingSave ? <Loader2 className="h-3.5 w-3.5 animate-spin mx-auto" /> : t('confirmScheduling')}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button onClick={handlePublish} disabled={publishState === 'publishing' || !readyToPublish}
                whileHover={readyToPublish ? { scale: 1.015, translateY: -1 } : undefined} whileTap={readyToPublish ? { scale: 0.985 } : undefined} transition={spring}
                className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[11.5px] font-extrabold uppercase tracking-wider text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${
                  publishState === 'success' ? 'bg-emerald-500 shadow-[0_4px_20px_rgba(16,185,129,0.4)]'
                  : publishState === 'error' ? 'bg-rose-600 shadow-[0_4px_20px_rgba(225,29,72,0.4)]'
                  : 'bg-gradient-to-r from-accent-purple via-[#9333ea] to-accent-cyan shadow-[0_4px_20px_rgba(139,92,246,0.3)] hover:shadow-[0_6px_28px_rgba(139,92,246,0.5)] border border-white/10'
                }`}>
                {publishState === 'publishing' && <><Loader2 className="h-3.5 w-3.5 animate-spin" />{tPublish('publishing')}</>}
                {publishState === 'success'    && <><Check className="h-3.5 w-3.5" />{tPublish('published')}</>}
                {publishState === 'error'      && <><X className="h-3.5 w-3.5" />{tPublish('failed')}</>}
                {publishState === 'idle'       && <><Send className="h-3.5 w-3.5" />{publishLabel}</>}
              </motion.button>
              
              {publishState === 'error' && publishError && (
                <ContextAlert tone="warn">{publishError}</ContextAlert>
              )}
              {publishState === 'success' && publishPermalink && (
                <a href={publishPermalink} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold transition-colors py-1">
                  <ExternalLink className="h-3 w-3" />{publishViewLabel}
                </a>
              )}
            </div>
          </div>
        </>
      ) : (
        /* Modo texto (LinkedIn / X) */
        <div className="max-w-2xl mx-auto w-full space-y-2.5 pt-2">
          {!content.trim() && <ContextAlert tone="info">{t('writeOrGenerateToPublish')}</ContextAlert>}
          {readyToPublish && publishState === 'idle' && <ContextAlert tone="ok">{t('readyToPublish')}</ContextAlert>}
          
          <div className="flex gap-2.5">
            <motion.button onClick={onOpenConfirmNewPost} disabled={publishState === 'publishing'}
              whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }} transition={spring}
              className="flex-1 flex items-center justify-center gap-1.5 py-3.5 rounded-2xl text-[11.5px] font-extrabold uppercase tracking-wider border border-white/[0.08] bg-white/[0.02] text-white/70 hover:text-white hover:border-white/[0.16] hover:bg-white/[0.04] transition-all cursor-pointer">
              <Plus className="h-4 w-4" />{t('newPost')}
            </motion.button>
            <motion.button onClick={handlePublish} disabled={publishState === 'publishing' || !readyToPublish}
              whileHover={readyToPublish ? { scale: 1.015, translateY: -1 } : undefined} whileTap={readyToPublish ? { scale: 0.985 } : undefined} transition={spring}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[11.5px] font-extrabold uppercase tracking-wider text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${
                publishState === 'success' ? 'bg-emerald-500 shadow-[0_4px_20px_rgba(16,185,129,0.4)]'
                : publishState === 'error' ? 'bg-rose-600 shadow-[0_4px_20px_rgba(225,29,72,0.4)]'
                : 'bg-gradient-to-r from-accent-purple via-[#9333ea] to-accent-cyan shadow-[0_4px_20px_rgba(139,92,246,0.3)] hover:shadow-[0_6px_28px_rgba(139,92,246,0.5)] border border-white/10'
              }`}>
              {publishState === 'publishing' && <><Loader2 className="h-4 w-4 animate-spin" />{tPublish('publishing')}</>}
              {publishState === 'success'    && <><Check className="h-4 w-4" />{tPublish('published')}</>}
              {publishState === 'error'      && <><X className="h-4 w-4" />{tPublish('failed')}</>}
              {publishState === 'idle'       && <><Send className="h-4 w-4" />{publishLabel}</>}
            </motion.button>
          </div>

          {publishState === 'error' && publishError && <ContextAlert tone="warn">{publishError}</ContextAlert>}
          {publishState === 'success' && publishPermalink && (
            <a href={publishPermalink} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold transition-colors py-1">
              <ExternalLink className="h-3 w-3" />{publishViewLabel}
            </a>
          )}
        </div>
      )}
    </div>
  );
}
