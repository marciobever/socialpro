"use client";
import React from 'react';
import {
  motion, useScroll, useTransform, AnimatePresence,
  useMotionTemplate, useMotionValue,
} from 'framer-motion';
import Lenis from 'lenis';
import { useTranslations } from 'next-intl';
import {
  Sparkles, BrainCircuit, ArrowRight, ShieldCheck,
  Zap, Check, Calendar, ChevronDown,
} from 'lucide-react';
import { Link, useRouter } from '@/i18n/navigation';
import { Reveal } from '@/components/landing/Reveal';
import { AnimatedCarouselPreview } from '@/components/landing/AnimatedCarouselPreview';
import { AnimatedChart } from '@/components/landing/AnimatedChart';
import { Footer } from '@/components/Footer';
import { OrganizationJsonLd, SoftwareApplicationJsonLd, WebSiteJsonLd } from '@/components/JsonLd';

// ── Animation constants ───────────────────────────────────────────────────────
const ease = [0.16, 1, 0.3, 1] as const;
const spring = { type: 'spring' as const, stiffness: 380, damping: 28 };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const fadeItem = {
  hidden: { opacity: 0, y: 20, filter: 'blur(5px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.42, ease } },
};

// ── Lenis smooth scroll ───────────────────────────────────────────────────────
function useLenis() {
  React.useEffect(() => {
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    let raf: number;
    const loop = (t: number) => { lenis.raf(t); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); lenis.destroy(); };
  }, []);
}

// ── GlowCard — cursor-tracking radial glow on hover ──────────────────────────
function GlowCard({
  children,
  className = '',
  glowColor = 'rgba(139,92,246,0.16)',
  hoverY = -5,
}: {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  hoverY?: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [hovered, setHovered] = React.useState(false);
  const gradientStyle = useMotionTemplate`radial-gradient(300px circle at ${mouseX}px ${mouseY}px, ${glowColor}, transparent 65%)`;

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative overflow-hidden ${className}`}
      style={{ background: '#0d0f17', border: '1px solid rgba(255,255,255,0.06)' }}
      whileHover={{ y: hoverY, borderColor: 'rgba(255,255,255,0.14)', boxShadow: '0 32px 60px -16px rgba(0,0,0,0.85)' }}
      transition={spring}
    >
      <motion.div
        className="absolute inset-0 pointer-events-none rounded-[inherit]"
        style={{ background: gradientStyle, opacity: hovered ? 1 : 0 }}
        transition={{ opacity: { duration: 0.22 } }}
      />
      <motion.div
        className="absolute inset-0 pointer-events-none rounded-[inherit]"
        animate={hovered
          ? { opacity: 1, background: 'linear-gradient(135deg, rgba(139,92,246,0.10) 0%, rgba(6,182,212,0.05) 100%)' }
          : { opacity: 0, background: 'transparent' }
        }
        transition={{ duration: 0.3 }}
      />
      {children}
    </motion.div>
  );
}

// ── SectionLabel ─────────────────────────────────────────────────────────────
function SectionLabel({ children, color = 'text-accent-purple' }: { children: React.ReactNode; color?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 text-[10px] tracking-[0.24em] font-extrabold uppercase ${color}`}>
      <span className="h-px w-5 bg-current opacity-50" />
      {children}
      <span className="h-px w-5 bg-current opacity-50" />
    </span>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  useLenis();
  const router = useRouter();
  const t = useTranslations('landing');
  const { scrollY } = useScroll();

  const orb1Y = useTransform(scrollY, [0, 1200], [0, 240]);
  const orb2Y = useTransform(scrollY, [0, 1200], [0, 140]);
  const mockY = useTransform(scrollY, [0, 800], [0, -44]);
  const mockSc = useTransform(scrollY, [0, 800], [1, 0.97]);

  const [selectedTone, setSelectedTone] = React.useState<'provocativo' | 'autoridade' | 'storyteller' | 'meme'>('provocativo');
  const [userInteracted, setUserInteracted] = React.useState(false);
  const [openFaq, setOpenFaq] = React.useState<number | null>(0);
  const [annualBilling, setAnnualBilling] = React.useState(false);

  React.useEffect(() => {
    if (userInteracted) return;
    const tones: ('provocativo' | 'autoridade' | 'storyteller' | 'meme')[] = ['provocativo', 'autoridade', 'storyteller', 'meme'];
    const timer = setInterval(() => setSelectedTone(c => tones[(tones.indexOf(c) + 1) % tones.length]), 4000);
    return () => clearInterval(timer);
  }, [userInteracted]);

  const tonePreviews = {
    provocativo: { title: t('toneProvocativoTitle'), copy: t('toneProvocativoCopy'), badge: t('toneProvocativoBadge') },
    autoridade:  { title: t('toneAutoridadeTitle'),  copy: t('toneAutoridadeCopy'),  badge: t('toneAutoridadeBadge') },
    storyteller: { title: t('toneStorytellerTitle'), copy: t('toneStorytellerCopy'), badge: t('toneStorytellerBadge') },
    meme:        { title: t('toneMemeTitle'),         copy: t('toneMemeCopy'),         badge: t('toneMemeBadge') },
  };

  const steps = [
    { step: '01', title: t('step1Title'), desc: t('step1Desc'), icon: '🎯' },
    { step: '02', title: t('step2Title'), desc: t('step2Desc'), icon: '⚡' },
    { step: '03', title: t('step3Title'), desc: t('step3Desc'), icon: '🧠' },
    { step: '04', title: t('step4Title'), desc: t('step4Desc'), icon: '📅' },
  ];

  const scheduleItems = [
    { day: t('sched1Day'), type: t('sched1Type'), platform: t('sched1Platform'), title: t('sched1Title'), time: '09:00', status: t('sched1Status'), dot: 'bg-emerald-500', badge: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
    { day: t('sched2Day'), type: t('sched2Type'), platform: t('sched2Platform'), title: t('sched2Title'), time: '18:00', status: t('sched2Status'), dot: 'bg-accent-purple', badge: 'bg-accent-purple/10 border-accent-purple/20 text-accent-purple' },
    { day: t('sched3Day'), type: t('sched3Type'), platform: t('sched3Platform'), title: t('sched3Title'), time: '12:00', status: t('sched3Status'), dot: 'bg-white/20', badge: 'bg-white/5 border-white/10 text-dark-muted' },
  ];

  const faqs = [
    { q: t('faq1q'), a: t('faq1a') },
    { q: t('faq2q'), a: t('faq2a') },
    { q: t('faq3q'), a: t('faq3a') },
    { q: t('faq4q'), a: t('faq4a') },
    { q: t('faq5q'), a: t('faq5a') },
  ];

  const plans = [
    {
      name: 'Starter Creator', price: 0, annualPrice: 0, recommended: false,
      desc: 'Para explorar a plataforma',
      features: ['Geração de texto com IA', 'Até 3 slides por carrossel', '1 Brand Kit', 'Preview de redes sociais'],
      cta: 'Começar Grátis', planId: 'starter',
    },
    {
      name: 'Pro Creator', price: 29, annualPrice: 23, recommended: true,
      desc: 'Para criadores sérios',
      features: ['25 carrosséis/mês com IA', 'Carrosséis de até 8 slides', 'Imagens geradas por IA', 'Tons de voz avançados', 'Banco de Ideias Virais', 'Calendário editorial + Analytics'],
      cta: 'Assinar Pro', planId: 'pro',
    },
    {
      name: 'Agency Scale', price: 79, annualPrice: 63, recommended: false,
      desc: 'Para agências e equipes',
      features: ['60 carrosséis/mês com IA', 'Tudo do Pro', 'Brand Kits ilimitados', 'Exportação Figma/PDF', 'Análise de concorrentes', 'Gerente de conta dedicado'],
      cta: 'Assinar Agency', planId: 'agency',
    },
  ];

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text relative flex flex-col overflow-x-hidden">
      <OrganizationJsonLd /><SoftwareApplicationJsonLd /><WebSiteJsonLd />

      {/* ── Fixed background layers ──────────────────────────────────────── */}
      <motion.div style={{ y: orb1Y }} className="fixed top-[-10%] left-[-8%] w-[600px] h-[600px] rounded-full bg-accent-purple/[0.07] blur-[140px] animate-glow-pulse pointer-events-none -z-10" />
      <motion.div style={{ y: orb2Y }} className="fixed top-[38%] right-[-10%] w-[520px] h-[520px] rounded-full bg-accent-cyan/[0.05] blur-[130px] pointer-events-none -z-10" />
      <div className="fixed inset-0 bg-grid-pattern grid-mask pointer-events-none -z-20" />

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full px-6 py-3.5">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.38, ease }}
            className="glass-panel rounded-2xl px-6 py-3.5 flex items-center justify-between shadow-2xl"
          >
            <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => router.push('/')}>
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-accent-purple to-accent-cyan p-[1.5px] transition-transform duration-300 group-hover:scale-105">
                <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-dark-bg">
                  <BrainCircuit className="h-[18px] w-[18px] brain-neon" />
                </div>
                <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-tr from-accent-purple to-accent-cyan opacity-40 blur-md group-hover:opacity-70 transition-opacity" />
              </div>
              <span className="font-display text-xl font-bold tracking-tight text-white">
                Social<span className="bg-gradient-to-r from-accent-cyan to-accent-purple bg-clip-text text-transparent">Pro</span>
              </span>
            </div>

            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-dark-muted">
              {[
                { label: t('navHowItWorks'), href: '#como-funciona' },
                { label: t('navFeatures'),   href: '#features' },
              ].map(item => (
                <motion.a key={item.href} href={item.href} className="text-dark-muted hover:text-white transition-colors" whileHover={{ color: '#fff' }}>
                  {item.label}
                </motion.a>
              ))}
              <Link href="/pricing" className="text-dark-muted hover:text-white transition-colors">{t('navPricing')}</Link>
            </nav>

            <div className="flex items-center gap-3">
              <Link href="/login" className="text-xs font-semibold text-dark-muted hover:text-white transition-colors hidden sm:block">{t('navSignIn')}</Link>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={spring}>
                <Link href="/login" className="relative group overflow-hidden inline-flex items-center gap-1.5 rounded-xl bg-white px-5 py-2 text-xs font-bold text-black border border-white/10">
                  <div className="absolute inset-0 bg-gradient-to-r from-accent-purple to-accent-cyan opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  <span className="relative z-10 group-hover:text-white transition-colors duration-200 flex items-center gap-1.5">
                    {t('navGetStarted')}
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* ── HERO — split layout desktop, stacked mobile ─────────────── */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section className="relative w-full z-10 min-h-[calc(100dvh-88px)] flex items-center">
        <div className="max-w-7xl w-full mx-auto px-6 py-16 lg:py-20 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

          {/* ── Copy — left ── */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left gap-6 lg:gap-7"
          >
            {/* Badge */}
            <motion.div variants={fadeItem} className="animate-float">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent-purple/30 bg-accent-purple/[0.07] text-[11px] font-semibold text-accent-cyan backdrop-blur-sm">
                <Sparkles className="h-3 w-3 text-accent-purple flex-shrink-0" />
                {t('heroBadge')}
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeItem}
              className="font-display text-[42px] md:text-[54px] lg:text-[58px] xl:text-[66px] font-extrabold tracking-tight text-white leading-[1.04] max-w-2xl"
            >
              {t.rich('heroH1', {
                highlight: (chunks) => (
                  <span className="bg-gradient-to-r from-accent-purple via-accent-pink to-accent-cyan bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-pan">
                    {chunks}
                  </span>
                ),
              })}
            </motion.h1>

            {/* Subtitle */}
            <motion.p variants={fadeItem} className="text-base md:text-[17px] text-dark-muted leading-relaxed max-w-lg">
              {t('heroDesc')}
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeItem} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={spring}>
                <Link href="/login" className="btn-press group relative overflow-hidden inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent-purple to-accent-cyan p-[1px] font-bold text-sm shadow-[0_8px_32px_rgba(139,92,246,0.3)]">
                  <div className="bg-dark-bg group-hover:bg-transparent rounded-[11px] px-7 py-3.5 transition-all duration-300">
                    <span className="flex items-center gap-2 text-white whitespace-nowrap">
                      {t('heroCta1')}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} transition={spring}>
                <Link href="/pricing" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold bg-white/[0.05] border border-white/[0.09] hover:bg-white/[0.09] hover:border-white/[0.18] text-white transition-all whitespace-nowrap">
                  {t('heroCta2')}
                </Link>
              </motion.div>
            </motion.div>

            {/* Social proof row */}
            <motion.div variants={fadeItem} className="flex items-center gap-3 pt-1">
              <div className="flex -space-x-2">
                {(['#8b5cf6','#06b6d4','#f43f5e','#f97316'] as const).map((c, i) => (
                  <div key={i} className="h-7 w-7 rounded-full border-2 border-dark-bg flex items-center justify-center text-[8px] font-black text-white" style={{ backgroundColor: c }}>
                    {['M','A','C','R'][i]}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-[11px] text-dark-muted leading-tight">
                  <span className="text-white font-bold">+2.400</span> criadores ativos
                </p>
              </div>
              <span className="h-4 w-px bg-white/[0.08]" />
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-accent-orange text-[11px] leading-none">★</span>
                ))}
                <span className="text-[11px] text-dark-muted ml-1 font-semibold">4.9</span>
              </div>
            </motion.div>
          </motion.div>

          {/* ── Mockup — right ── */}
          <motion.div
            style={{ y: mockY, scale: mockSc }}
            initial={{ opacity: 0, x: 36, filter: 'blur(12px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.65, ease, delay: 0.18 }}
            className="flex-1 relative w-full"
          >
            {/* Floating card: engagement */}
            <motion.div
              initial={{ opacity: 0, x: -20, y: 8 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.48, ease, delay: 0.72 }}
              className="absolute -left-3 lg:-left-7 top-[18%] z-30 glass-panel-heavy rounded-2xl px-3.5 py-2.5 flex items-center gap-3 shadow-[0_12px_40px_rgba(0,0,0,0.6)] pointer-events-none"
            >
              <div className="h-9 w-9 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center flex-shrink-0 text-base">📈</div>
              <div>
                <p className="text-[13px] font-black text-white leading-none">+218%</p>
                <p className="text-[9.5px] text-dark-muted mt-0.5">Engajamento médio</p>
              </div>
            </motion.div>

            {/* Floating card: generated notification */}
            <motion.div
              initial={{ opacity: 0, x: 20, y: 8 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.48, ease, delay: 0.9 }}
              className="absolute -right-2 lg:-right-6 bottom-[20%] z-30 glass-panel-heavy rounded-2xl px-3.5 py-2.5 flex items-center gap-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.6)] pointer-events-none"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
              <div>
                <p className="text-[11px] font-bold text-white leading-none">Carrossel pronto</p>
                <p className="text-[9px] text-dark-muted mt-0.5">agora mesmo · 0.8s</p>
              </div>
            </motion.div>

            {/* Ambient glow behind mockup */}
            <div className="absolute inset-8 rounded-3xl bg-gradient-to-tr from-accent-purple/10 via-transparent to-accent-cyan/10 blur-3xl -z-10 scale-110" />

            {/* Mockup frame */}
            <div className="relative w-full rounded-2xl border border-white/[0.09] bg-[#0a0b10] p-2 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.06)] overflow-hidden">
              {/* Top line glow */}
              <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-accent-purple/60 to-transparent pointer-events-none" />

              {/* Window chrome */}
              <div className="flex items-center gap-1.5 px-3 py-2 mb-2 border-b border-white/[0.04] bg-white/[0.015] rounded-t-[14px]">
                {['#ff5f57','#ffbd2e','#28c840'].map((c, i) => (
                  <div key={i} className="h-2 w-2 rounded-full" style={{ backgroundColor: c }} />
                ))}
                <div className="flex-1 mx-3 h-4 rounded-md bg-white/[0.04] flex items-center px-2">
                  <span className="text-[6px] text-white/20 font-mono">app.socialpro.ai/dashboard</span>
                </div>
              </div>

              {/* App content */}
              <div className="rounded-[14px] bg-[#080910] border border-white/[0.04] p-3 grid grid-cols-12 gap-3">

                {/* Sidebar */}
                <div className="col-span-3 border-r border-white/[0.04] pr-3 space-y-3 hidden md:flex md:flex-col">
                  <div className="flex items-center gap-1.5 pb-2 border-b border-white/[0.04]">
                    <div className="h-5 w-5 rounded-lg bg-gradient-to-tr from-accent-purple to-accent-cyan p-[1px] flex-shrink-0">
                      <div className="h-full w-full rounded-[4px] bg-[#080910] flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-accent-purple/80" />
                      </div>
                    </div>
                    <span className="text-[8px] font-bold text-white/80">SocialPro</span>
                  </div>
                  <div className="space-y-0.5">
                    {[
                      { label: 'Dashboard',  active: true  },
                      { label: 'Carrosséis', active: false },
                      { label: 'Calendário', active: false },
                      { label: 'Analytics',  active: false },
                      { label: 'Brand Kit',  active: false },
                    ].map(item => (
                      <div key={item.label} className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[7.5px] font-medium ${item.active ? 'bg-accent-purple/15 text-accent-purple border border-accent-purple/20' : 'text-white/30'}`}>
                        <div className={`h-1 w-1 rounded-full flex-shrink-0 ${item.active ? 'bg-accent-purple' : 'bg-white/15'}`} />
                        {item.label}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Main */}
                <div className="col-span-12 md:col-span-6 space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-accent-purple/[0.07] border border-accent-purple/[0.16] rounded-xl p-2.5 space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[7.5px] font-bold text-accent-purple uppercase tracking-wide">Carrosséis</span>
                        <span className="text-[6.5px] text-emerald-400 font-bold">↑ ativo</span>
                      </div>
                      <div className="text-[18px] font-black text-white leading-none">12<span className="text-[8px] font-medium text-white/40 ml-0.5">/ 25</span></div>
                      <div className="h-[3px] w-full bg-white/[0.06] rounded-full overflow-hidden">
                        <div className="h-full w-[48%] bg-gradient-to-r from-accent-purple to-accent-cyan rounded-full" />
                      </div>
                      <span className="text-[6.5px] text-white/35">este mês</span>
                    </div>
                    <div className="bg-emerald-500/[0.06] border border-emerald-500/[0.14] rounded-xl p-2.5 space-y-1.5">
                      <span className="text-[7.5px] font-bold text-emerald-400 uppercase tracking-wide block">Engajamento</span>
                      <div className="text-[18px] font-black text-white leading-none">+218<span className="text-[10px]">%</span></div>
                      <div className="flex items-center gap-1">
                        <span className="text-[6.5px] text-emerald-400 font-bold">▲ alta</span>
                        <span className="text-[6.5px] text-white/35">esta semana</span>
                      </div>
                      <div className="h-[3px] w-full bg-white/[0.06] rounded-full overflow-hidden">
                        <div className="h-full w-[78%] bg-gradient-to-r from-emerald-500 to-accent-cyan rounded-full" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-2.5 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[7.5px] font-bold text-white/60 uppercase tracking-wide">Próximos posts</span>
                      <span className="text-[6.5px] text-emerald-400 font-semibold px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md">3 agendados</span>
                    </div>
                    <div className="space-y-1.5">
                      {[
                        { day: 'Ter', title: '5 Erros que destroem seu alcance', time: '09:00', color: 'bg-emerald-500' },
                        { day: 'Qui', title: 'Como crescer 10k em 30 dias', time: '18:00', color: 'bg-accent-purple' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-[6.5px]">
                          <span className="text-white/30 font-bold w-4 text-center flex-shrink-0">{item.day}</span>
                          <div className={`h-1 w-1 rounded-full flex-shrink-0 ${item.color}`} />
                          <span className="text-white/60 truncate flex-1">{item.title}</span>
                          <span className="text-white/30 flex-shrink-0 font-mono">{item.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Phone */}
                <div className="col-span-12 md:col-span-3 flex justify-center items-center border-l border-white/[0.04] pl-3">
                  <div className="w-[68px] aspect-[9/19] bg-[#0c0d14] rounded-[14px] border border-white/[0.14] p-1 flex flex-col justify-between shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
                    <div className="h-0.5 w-4 bg-white/25 rounded-full mx-auto mt-0.5" />
                    <div className="flex-1 my-1 rounded-[7px] bg-[#080910] border border-white/[0.05] overflow-hidden flex flex-col">
                      <div className="px-1.5 pt-1.5 pb-1 flex items-center gap-1 border-b border-white/[0.05]">
                        <div className="h-2.5 w-2.5 rounded-full bg-gradient-to-tr from-accent-orange to-accent-pink flex-shrink-0" />
                        <span className="text-[4.5px] text-white/60 font-semibold truncate">@marcelo.growth</span>
                      </div>
                      <div className="flex-1 m-1 rounded-md flex flex-col justify-between p-1.5" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 60%, #c084fc 100%)' }}>
                        <span className="text-[3.5px] font-black uppercase tracking-widest bg-black/30 px-1 py-0.5 rounded text-white/90 w-fit">GANCHO</span>
                        <div className="space-y-0.5">
                          <p className="text-[4.5px] font-black text-white uppercase leading-tight">PARE DE<br/>POSTAR NO<br/>VAZIO</p>
                          <div className="flex gap-0.5 pt-0.5">
                            {[1,2,3,4].map(d => <div key={d} className={`h-0.5 rounded-full ${d===1?'w-2 bg-white':'w-1 bg-white/40'}`} />)}
                          </div>
                        </div>
                      </div>
                      <div className="px-1.5 py-1 flex items-center gap-1.5">
                        <span className="text-[4.5px]">❤️</span>
                        <span className="text-[4.5px]">💬</span>
                        <span className="text-[4.5px] text-white/30 ml-auto">↗</span>
                      </div>
                    </div>
                    <div className="h-0.5 w-5 bg-white/30 rounded-full mx-auto mb-0.5" />
                  </div>
                </div>

              </div>
              {/* Subtle inner ring */}
              <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/[0.04] pointer-events-none" />
            </div>
          </motion.div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* ── Como Funciona ───────────────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section id="como-funciona" className="relative z-10 border-t border-white/[0.05]">
        <div className="max-w-7xl w-full mx-auto px-6 py-24 lg:py-28 space-y-16">
          <Reveal className="text-center space-y-4">
            <SectionLabel color="text-accent-purple">{t('howSectionLabel')}</SectionLabel>
            <h2 className="font-display text-3xl md:text-[40px] font-extrabold text-white tracking-tight">{t('howTitle')}</h2>
            <p className="text-base text-dark-muted max-w-md mx-auto leading-relaxed">{t('howDesc')}</p>
          </Reveal>

          <div className="relative">
            {/* Step connector — desktop only */}
            <div className="hidden md:block absolute top-[62px] left-[calc(12.5%+1.5rem)] right-[calc(12.5%+1.5rem)] h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent pointer-events-none" />
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-10% 0px' }}
              variants={stagger}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 relative z-10"
            >
              {steps.map((item, i) => (
                <motion.div key={i} variants={fadeItem} className="h-full">
                  <GlowCard className="rounded-3xl p-7 h-full flex flex-col gap-5 text-left" hoverY={-6}>
                    <div className="flex items-start justify-between">
                      <span className="font-display text-[64px] font-black leading-none bg-gradient-to-br from-accent-purple/75 via-accent-cyan/55 to-transparent bg-clip-text text-transparent select-none">
                        {item.step}
                      </span>
                      <div className="h-9 w-9 rounded-xl border border-white/[0.07] bg-white/[0.03] flex items-center justify-center text-[18px]">
                        {item.icon}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 flex-1">
                      <h3 className="font-display text-sm font-bold text-white">{item.title}</h3>
                      <p className="text-xs text-dark-muted leading-relaxed">{item.desc}</p>
                    </div>
                    <div className="h-px w-10 bg-gradient-to-r from-accent-purple/60 to-transparent" />
                  </GlowCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* ── Features Bento ──────────────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section id="features" className="relative z-10 border-t border-white/[0.05]">
        <div className="max-w-7xl w-full mx-auto px-6 py-24 lg:py-28 space-y-14">
          <Reveal className="text-center space-y-4">
            <SectionLabel color="text-accent-cyan">{t('featSectionLabel')}</SectionLabel>
            <h2 className="font-display text-3xl md:text-[40px] font-extrabold text-white tracking-tight">{t('featTitle')}</h2>
            <p className="text-base text-dark-muted max-w-md mx-auto leading-relaxed">{t('featDesc')}</p>
          </Reveal>

          <Reveal from="up" className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* ① Carousel Generator — 2/3 */}
            <GlowCard className="rounded-3xl p-7 col-span-1 md:col-span-2 flex flex-col gap-6 min-h-[460px]" glowColor="rgba(139,92,246,0.13)">
              <div className="flex items-start gap-4">
                <motion.div className="p-3 bg-accent-purple/10 border border-accent-purple/20 text-accent-purple rounded-2xl flex-shrink-0" whileHover={{ scale: 1.1, rotate: 5 }} transition={spring}>
                  <Zap className="h-5 w-5" />
                </motion.div>
                <div className="space-y-2">
                  <h3 className="font-display text-lg font-bold text-white">{t('card1Title')}</h3>
                  <p className="text-sm text-dark-muted leading-relaxed max-w-lg">{t('card1Desc')}</p>
                </div>
              </div>
              <div className="flex-1 min-h-[240px] bg-[#05060a] rounded-2xl border border-white/[0.05] flex items-center justify-center overflow-hidden relative shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <AnimatedCarouselPreview />
              </div>
            </GlowCard>

            {/* ② Voice Tone — 1/3 */}
            <GlowCard className="rounded-3xl p-7 col-span-1 flex flex-col gap-6 min-h-[460px]" glowColor="rgba(6,182,212,0.12)">
              <div className="flex items-start gap-4">
                <motion.div className="p-3 bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan rounded-2xl flex-shrink-0" whileHover={{ scale: 1.1, rotate: -5 }} transition={spring}>
                  <BrainCircuit className="h-5 w-5" />
                </motion.div>
                <div className="space-y-2">
                  <h3 className="font-display text-lg font-bold text-white">{t('card2Title')}</h3>
                  <p className="text-xs text-dark-muted leading-relaxed">{t('card2Desc')}</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 flex-1">
                {/* Tone pills */}
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(tonePreviews) as Array<keyof typeof tonePreviews>).map(tKey => {
                    const isActive = selectedTone === tKey;
                    return (
                      <motion.button
                        key={tKey}
                        onClick={() => { setSelectedTone(tKey); setUserInteracted(true); }}
                        animate={isActive ? { scale: 1.02 } : { scale: 1 }}
                        whileTap={{ scale: 0.97 }}
                        transition={spring}
                        className={`py-2.5 px-3 rounded-xl text-[10px] font-bold text-center border cursor-pointer transition-all duration-200 ${
                          isActive
                            ? 'bg-gradient-to-r from-accent-purple/20 to-accent-cyan/15 border-accent-cyan/35 text-white shadow-[0_0_16px_rgba(6,182,212,0.08)]'
                            : 'bg-white/[0.03] border-white/[0.07] text-dark-muted hover:text-white hover:bg-white/[0.06] hover:border-white/[0.12]'
                        }`}
                      >
                        {tonePreviews[tKey].title}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Caption preview */}
                <div className="flex-1 bg-[#05060a] border border-white/[0.05] rounded-2xl p-4 flex flex-col gap-3 overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                  <div className="flex justify-between items-center pb-2.5 border-b border-white/[0.05]">
                    <span className="text-[7.5px] font-extrabold uppercase tracking-widest text-accent-cyan flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent-cyan animate-pulse" />
                      {t('editorLabel')}
                    </span>
                    <span className="text-[7.5px] font-bold uppercase px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.08] text-dark-muted tracking-wide">
                      {tonePreviews[selectedTone].badge}
                    </span>
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={selectedTone}
                      initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
                      transition={{ duration: 0.28, ease }}
                      className="text-[9.5px] text-white/80 leading-relaxed italic select-none font-medium flex-1 overflow-y-auto"
                    >
                      &ldquo;{tonePreviews[selectedTone].copy}&rdquo;
                    </motion.p>
                  </AnimatePresence>
                </div>
              </div>
            </GlowCard>

            {/* ③ Brand Kit — 1/3 */}
            <GlowCard className="rounded-3xl p-7 col-span-1 flex flex-col gap-6 min-h-[460px]" glowColor="rgba(249,115,22,0.10)">
              <div className="flex items-start gap-4">
                <motion.div className="p-3 bg-accent-orange/10 border border-accent-orange/20 text-accent-orange rounded-2xl flex-shrink-0" whileHover={{ scale: 1.1, rotate: 5 }} transition={spring}>
                  <ShieldCheck className="h-5 w-5" />
                </motion.div>
                <div className="space-y-2">
                  <h3 className="font-display text-lg font-bold text-white">{t('card3Title')}</h3>
                  <p className="text-xs text-dark-muted leading-relaxed">{t('card3Desc')}</p>
                </div>
              </div>

              <div className="flex-1">
                <div className="rounded-2xl p-5 flex flex-col gap-5 border border-white/[0.07] h-full shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]" style={{ background: '#090b12' }}>
                  {/* Profile row */}
                  <div className="flex items-center gap-3.5">
                    <div className="relative flex-shrink-0">
                      <div className="h-11 w-11 rounded-full bg-gradient-to-tr from-accent-orange to-accent-pink p-[1.5px]">
                        <div className="h-full w-full rounded-full bg-[#0c0d14] flex items-center justify-center text-[11px] font-black text-white">MS</div>
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-[#090b12] animate-pulse" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-display text-sm font-bold text-white">Marcelo Silva</span>
                        <span className="text-accent-orange text-[10px] font-bold">✓</span>
                      </div>
                      <p className="text-[10px] text-dark-muted">@marcelo.growth</p>
                    </div>
                    <span className="text-[7.5px] font-bold uppercase px-2 py-0.5 rounded-full bg-accent-orange/10 border border-accent-orange/20 text-accent-orange tracking-wide flex-shrink-0">
                      {t('kitActive')}
                    </span>
                  </div>

                  <div className="h-px bg-white/[0.05]" />

                  {/* Palette */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[8px] text-dark-muted uppercase font-bold tracking-widest block">{t('palette')}</span>
                        <span className="text-[10px] font-semibold text-white/80 mt-0.5 block">{t('paletteTheme')}</span>
                      </div>
                      <div className="flex gap-1.5">
                        {['#8b5cf6', '#06b6d4', '#f43f5e', '#f97316'].map((color, i) => (
                          <motion.div key={i} className="h-5 w-5 rounded-full border-2 border-white/10 cursor-pointer" style={{ backgroundColor: color }} whileHover={{ scale: 1.3, borderColor: 'rgba(255,255,255,0.4)' }} transition={spring} />
                        ))}
                      </div>
                    </div>
                    <div className="h-1.5 w-full rounded-full overflow-hidden flex">
                      {['#8b5cf6','#06b6d4','#f43f5e','#f97316'].map((c, i) => (
                        <div key={i} className="flex-1 h-full" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </div>

                  {/* Watermark toggle */}
                  <div className="flex items-center justify-between text-[10px] pt-1">
                    <span className="text-white/75 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent-orange flex-shrink-0" />
                      {t('watermark')}
                    </span>
                    <div className="h-5 w-9 rounded-full bg-accent-orange/20 border border-accent-orange/30 p-0.5 flex items-center justify-end cursor-pointer">
                      <motion.div className="h-4 w-4 rounded-full bg-accent-orange shadow-sm" whileHover={{ scale: 1.1 }} />
                    </div>
                  </div>
                </div>
              </div>
            </GlowCard>

            {/* ④ Calendar & Analytics — 2/3 */}
            <GlowCard className="rounded-3xl p-7 col-span-1 md:col-span-2 flex flex-col gap-6 min-h-[460px]" glowColor="rgba(6,182,212,0.10)">
              <div className="flex items-start gap-4">
                <motion.div className="p-3 bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan rounded-2xl flex-shrink-0" whileHover={{ scale: 1.1, rotate: -5 }} transition={spring}>
                  <Calendar className="h-5 w-5" />
                </motion.div>
                <div className="space-y-2">
                  <h3 className="font-display text-lg font-bold text-white">{t('card4Title')}</h3>
                  <p className="text-sm text-dark-muted leading-relaxed max-w-lg">{t('card4Desc')}</p>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Schedule list */}
                <div className="lg:col-span-5 flex flex-col gap-3 rounded-2xl border border-white/[0.05] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]" style={{ background: '#05060a' }}>
                  <div>
                    <span className="text-[8.5px] font-bold uppercase text-accent-cyan tracking-widest block">{t('schedLabel')}</span>
                    <h4 className="text-xs font-bold text-white mt-0.5">{t('schedTitle')}</h4>
                  </div>
                  <div className="flex flex-col gap-2">
                    {scheduleItems.map((item, i) => (
                      <motion.div
                        key={i}
                        className="flex items-center justify-between p-2.5 rounded-xl border cursor-pointer text-[10px]"
                        style={{ background: '#0a0c14', borderColor: 'rgba(255,255,255,0.05)' }}
                        whileHover={{ borderColor: 'rgba(255,255,255,0.12)', background: '#0f1220' }}
                        transition={{ duration: 0.18 }}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="font-bold text-[9px] w-6 text-center text-dark-muted flex-shrink-0">{item.day}</span>
                          <div className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${item.dot}`} />
                          <div>
                            <span className="font-bold text-white leading-none truncate max-w-[110px] block">{item.title}</span>
                            <span className="text-[8px] text-dark-muted mt-0.5 block">{item.platform} · {item.type}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-[8px] text-dark-muted font-mono">{item.time}</span>
                          <span className={`text-[7px] font-bold uppercase px-1.5 py-0.5 rounded border tracking-wide leading-none ${item.badge}`}>{item.status}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Chart */}
                <div className="lg:col-span-7 rounded-2xl border border-white/[0.05] overflow-hidden p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]" style={{ background: '#05060a' }}>
                  <AnimatedChart />
                </div>
              </div>
            </GlowCard>

          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* ── Pricing ─────────────────────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 border-t border-white/[0.05]">
        <div className="max-w-7xl w-full mx-auto px-6 py-24 lg:py-28 space-y-14">
          <Reveal className="text-center space-y-4">
            <SectionLabel color="text-accent-purple">Planos e Preços</SectionLabel>
            <h2 className="font-display text-3xl md:text-[40px] font-extrabold text-white tracking-tight">
              Simples. Transparente.{' '}
              <span className="bg-gradient-to-r from-accent-purple to-accent-cyan bg-clip-text text-transparent">Sem surpresas.</span>
            </h2>
            <p className="text-base text-dark-muted max-w-md mx-auto">Cancele ou mude de plano a qualquer momento.</p>
          </Reveal>

          {/* Billing toggle */}
          <Reveal className="flex items-center justify-center gap-4">
            <span className={`text-sm font-semibold transition-colors duration-200 ${!annualBilling ? 'text-white' : 'text-dark-muted'}`}>Mensal</span>
            <button
              onClick={() => setAnnualBilling(v => !v)}
              className={`relative h-7 w-12 rounded-full border transition-all duration-300 cursor-pointer ${annualBilling ? 'bg-accent-purple/70 border-accent-purple/40' : 'bg-white/10 border-white/10'}`}
            >
              <motion.span
                animate={{ x: annualBilling ? 22 : 4 }}
                transition={spring}
                className="absolute top-[5px] h-[14px] w-[14px] rounded-full bg-white shadow-md block"
              />
            </button>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold transition-colors duration-200 ${annualBilling ? 'text-white' : 'text-dark-muted'}`}>Anual</span>
              <span className="text-[9px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">-20%</span>
            </div>
          </Reveal>

          {/* Plan cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 items-start max-w-5xl mx-auto">
            {plans.map((plan, i) => {
              const displayPrice = annualBilling ? plan.annualPrice : plan.price;
              return (
                <motion.div
                  key={plan.planId}
                  initial={{ opacity: 0, y: 28, filter: 'blur(6px)' }}
                  whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  viewport={{ once: true, margin: '-8% 0px' }}
                  transition={{ duration: 0.4, ease, delay: i * 0.08 }}
                  className={`relative flex flex-col rounded-3xl p-7 border ${
                    plan.recommended
                      ? 'border-accent-purple/35 shadow-[0_0_60px_rgba(139,92,246,0.10),0_24px_64px_-12px_rgba(0,0,0,0.8)] md:scale-[1.03]'
                      : 'border-white/[0.07] shadow-[0_16px_48px_-12px_rgba(0,0,0,0.6)]'
                  }`}
                  style={{ background: plan.recommended ? 'linear-gradient(160deg, #0f0d1a 0%, #0d0f17 100%)' : '#0d0f17' }}
                  whileHover={{ y: plan.recommended ? -6 : -4, transition: spring }}
                >
                  {plan.recommended && (
                    <>
                      <div className="absolute top-0 left-12 right-12 h-px bg-gradient-to-r from-transparent via-accent-purple/70 to-transparent" />
                      <div className="absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-purple/40 to-transparent blur-sm" />
                    </>
                  )}

                  <div className="space-y-6 flex-1">
                    {/* Plan header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-display text-base font-bold text-white">{plan.name}</h3>
                        <p className="text-xs text-dark-muted mt-1 leading-relaxed">{plan.desc}</p>
                      </div>
                      {plan.recommended && (
                        <span className="flex-shrink-0 text-[8px] font-bold uppercase px-2.5 py-1 rounded-full bg-accent-purple/20 border border-accent-purple/35 text-accent-purple tracking-wide">
                          Recomendado
                        </span>
                      )}
                    </div>

                    {/* Price */}
                    <div className="flex items-end gap-1.5">
                      {displayPrice > 0 && <span className="text-base font-bold text-dark-muted mb-2">$</span>}
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={`${plan.planId}-${displayPrice}`}
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.2, ease }}
                          className="text-[52px] font-black tracking-tight font-display leading-none text-white"
                        >
                          {displayPrice === 0 ? 'Grátis' : displayPrice}
                        </motion.span>
                      </AnimatePresence>
                      {displayPrice > 0 && <span className="text-sm text-dark-muted mb-2">/mês</span>}
                    </div>

                    {annualBilling && plan.price > 0 && (
                      <p className="text-[10px] text-dark-muted -mt-4">
                        Cobrado anualmente —{' '}
                        <span className="text-emerald-400 font-semibold">economize ${(plan.price - plan.annualPrice) * 12}/ano</span>
                      </p>
                    )}

                    <div className="h-px bg-white/[0.06]" />

                    {/* Features */}
                    <ul className="space-y-3">
                      {plan.features.map(f => (
                        <li key={f} className="flex items-start gap-2.5 text-sm text-dark-muted">
                          <Check className="h-4 w-4 text-accent-cyan flex-shrink-0 mt-0.5" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA */}
                  <div className="pt-7 space-y-2.5">
                    <motion.button
                      onClick={() => router.push(`/login?plan=${plan.planId}`)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      transition={spring}
                      className={`w-full py-3.5 rounded-xl text-sm font-bold cursor-pointer transition-all ${
                        plan.recommended
                          ? 'bg-gradient-to-r from-accent-purple to-accent-cyan text-white shadow-[0_4px_24px_rgba(139,92,246,0.35)] hover:shadow-[0_4px_32px_rgba(139,92,246,0.5)]'
                          : 'bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.09] hover:border-white/[0.15] text-white'
                      }`}
                    >
                      {plan.cta}
                    </motion.button>
                    {plan.planId === 'starter' && (
                      <p className="text-center text-[10px] text-dark-muted">Sem cartão de crédito</p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          <Reveal className="text-center pt-2">
            <p className="text-xs text-dark-muted">
              Dúvidas?{' '}
              <a href="mailto:contato@socialpro.ai" className="text-accent-cyan hover:underline transition-colors">contato@socialpro.ai</a>
            </p>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* ── FAQ ─────────────────────────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 border-t border-white/[0.05]">
        <div className="max-w-4xl w-full mx-auto px-6 py-24 lg:py-28 space-y-14">
          <Reveal className="text-center space-y-4">
            <SectionLabel color="text-accent-purple">{t('faqSectionLabel')}</SectionLabel>
            <h2 className="font-display text-3xl md:text-[40px] font-extrabold text-white tracking-tight">{t('faqTitle')}</h2>
            <p className="text-base text-dark-muted max-w-md mx-auto">{t('faqDesc')}</p>
          </Reveal>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-8% 0px' }}
            variants={stagger}
            className="space-y-3"
          >
            {faqs.map((faq, i) => (
              <motion.div key={i} variants={fadeItem}>
                <div
                  className="border rounded-2xl overflow-hidden transition-colors duration-200 hover:border-white/[0.12]"
                  style={{ background: '#0d0f17', borderColor: openFaq === i ? 'rgba(139,92,246,0.25)' : 'rgba(255,255,255,0.07)' }}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-6 py-5 text-left gap-4 cursor-pointer"
                  >
                    <span className="text-sm font-semibold text-white leading-snug">{faq.q}</span>
                    <motion.div
                      animate={{ rotate: openFaq === i ? 180 : 0 }}
                      transition={spring}
                      className={`flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center border transition-colors ${
                        openFaq === i ? 'border-accent-purple/40 bg-accent-purple/10 text-accent-purple' : 'border-white/[0.10] text-dark-muted'
                      }`}
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </motion.div>
                  </button>
                  <AnimatePresence initial={false}>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-5 pt-0">
                          <div className="h-px bg-white/[0.05] mb-4" />
                          <p className="text-sm text-dark-muted leading-relaxed">{faq.a}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* ── Final CTA ───────────────────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 border-t border-white/[0.05] overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent-purple/[0.06] via-transparent to-accent-cyan/[0.04] pointer-events-none" />
        <div className="absolute inset-0 bg-grid-pattern grid-mask opacity-30 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px bg-gradient-to-r from-transparent via-accent-purple/50 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-px bg-gradient-to-r from-transparent via-accent-cyan/30 to-transparent pointer-events-none" />

        <div className="max-w-4xl w-full mx-auto px-6 py-28 lg:py-36 text-center relative space-y-8">
          <Reveal>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent-cyan/25 bg-accent-cyan/[0.07] text-[11px] font-semibold text-accent-cyan">
              <Sparkles className="h-3 w-3" />
              {t('ctaFinalBadge')}
            </span>
          </Reveal>

          <Reveal delay={80}>
            <h2 className="font-display text-4xl md:text-5xl lg:text-[60px] font-extrabold text-white tracking-tight leading-[1.05] max-w-3xl mx-auto">
              {t.rich('ctaFinalTitle', {
                highlight: (chunks) => (
                  <span className="bg-gradient-to-r from-accent-purple to-accent-cyan bg-clip-text text-transparent">{chunks}</span>
                ),
              })}
            </h2>
          </Reveal>

          <Reveal delay={160}>
            <p className="text-lg text-dark-muted leading-relaxed max-w-lg mx-auto">{t('ctaFinalDesc')}</p>
          </Reveal>

          <Reveal delay={240}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} transition={spring}>
                <Link href="/login" className="btn-press group relative overflow-hidden inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent-purple to-accent-cyan p-[1px] font-bold text-sm shadow-[0_8px_40px_rgba(139,92,246,0.35)]">
                  <div className="bg-dark-bg group-hover:bg-transparent rounded-[11px] px-8 py-4 transition-all duration-300">
                    <span className="flex items-center gap-2 text-white">
                      {t('ctaFinalCta1')}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} transition={spring}>
                <Link href="/pricing" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-sm font-semibold bg-white/[0.05] border border-white/[0.09] hover:bg-white/[0.09] hover:border-white/[0.18] text-white transition-all">
                  {t('ctaFinalCta2')}
                </Link>
              </motion.div>
            </div>
            <p className="text-xs text-dark-muted pt-3">Sem cartão de crédito · Cancele quando quiser · Acesso imediato</p>
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}
