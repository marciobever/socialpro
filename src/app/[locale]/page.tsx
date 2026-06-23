"use client";
import React from 'react';
import { useTranslations } from 'next-intl';
import { Sparkles, BrainCircuit, ArrowRight, ShieldCheck, Zap, Check } from 'lucide-react';
import { Link, useRouter } from '@/i18n/navigation';
import { Reveal } from '@/components/landing/Reveal';
import { AnimatedCarouselPreview } from '@/components/landing/AnimatedCarouselPreview';
import { AnimatedChart } from '@/components/landing/AnimatedChart';
import { Footer } from '@/components/Footer';

export default function LandingPage() {
  const router = useRouter();
  const t = useTranslations('landing');

  const [selectedTone, setSelectedTone] = React.useState<'provocativo' | 'autoridade' | 'storyteller' | 'meme'>('provocativo');
  const [userInteracted, setUserInteracted] = React.useState(false);

  React.useEffect(() => {
    if (userInteracted) return;
    const tones: ('provocativo' | 'autoridade' | 'storyteller' | 'meme')[] = ['provocativo', 'autoridade', 'storyteller', 'meme'];
    const timer = setInterval(() => {
      setSelectedTone((current) => {
        const nextIndex = (tones.indexOf(current) + 1) % tones.length;
        return tones[nextIndex];
      });
    }, 4000);
    return () => clearInterval(timer);
  }, [userInteracted]);

  const tonePreviews = {
    provocativo: {
      title: t('toneProvocativoTitle'),
      copy: t('toneProvocativoCopy'),
      badge: t('toneProvocativoBadge'),
    },
    autoridade: {
      title: t('toneAutoridadeTitle'),
      copy: t('toneAutoridadeCopy'),
      badge: t('toneAutoridadeBadge'),
    },
    storyteller: {
      title: t('toneStorytellerTitle'),
      copy: t('toneStorytellerCopy'),
      badge: t('toneStorytellerBadge'),
    },
    meme: {
      title: t('toneMemeTitle'),
      copy: t('toneMemeCopy'),
      badge: t('toneMemeBadge'),
    },
  };

  const steps = [
    { step: '01', title: t('step1Title'), desc: t('step1Desc') },
    { step: '02', title: t('step2Title'), desc: t('step2Desc') },
    { step: '03', title: t('step3Title'), desc: t('step3Desc') },
    { step: '04', title: t('step4Title'), desc: t('step4Desc') },
  ];

  const scheduleItems = [
    {
      day: t('sched1Day'), type: t('sched1Type'), platform: t('sched1Platform'),
      title: t('sched1Title'), time: '09:00', status: t('sched1Status'),
      statusColor: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    },
    {
      day: t('sched2Day'), type: t('sched2Type'), platform: t('sched2Platform'),
      title: t('sched2Title'), time: '18:00', status: t('sched2Status'),
      statusColor: 'bg-accent-purple/10 border-accent-purple/20 text-accent-purple',
    },
    {
      day: t('sched3Day'), type: t('sched3Type'), platform: t('sched3Platform'),
      title: t('sched3Title'), time: '12:00', status: t('sched3Status'),
      statusColor: 'bg-white/5 border-white/10 text-dark-muted',
    },
  ];

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text relative flex flex-col justify-between overflow-x-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-accent-purple/10 blur-[120px] animate-glow-pulse pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-accent-cyan/10 blur-[150px] pointer-events-none"></div>
      <div className="absolute inset-0 bg-grid-pattern grid-mask pointer-events-none -z-10"></div>

      {/* Floating Header */}
      <header className="w-full px-6 py-4 relative z-50">
        <div className="mx-auto max-w-7xl">
          <div className="glass-panel rounded-2xl px-6 py-4 flex items-center justify-between shadow-2xl">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-accent-purple to-accent-cyan p-[1px]">
                <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-dark-bg">
                  <BrainCircuit className="h-5 w-5 brain-neon" />
                </div>
                <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-tr from-accent-purple to-accent-cyan opacity-30 blur-md" />
              </div>
              <span className="font-display text-xl font-bold tracking-tight text-white">
                Social<span className="bg-gradient-to-r from-accent-cyan to-accent-purple bg-clip-text text-transparent">Pro</span>
              </span>
            </div>

            <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-dark-muted">
              <a href="#como-funciona" className="hover:text-white transition-colors">{t('navHowItWorks')}</a>
              <a href="#features" className="hover:text-white transition-colors">{t('navFeatures')}</a>
              <Link href="/pricing" className="hover:text-white transition-colors">{t('navPricing')}</Link>
            </nav>

            <div className="flex items-center gap-4">
              <Link href="/login" className="text-xs font-bold hover:text-white transition-colors text-dark-muted">{t('navSignIn')}</Link>
              <Link href="/login" className="relative group overflow-hidden rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-black hover:text-white border border-white/10">
                <div className="absolute inset-0 -z-10 bg-gradient-to-r from-accent-purple to-accent-cyan opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="flex items-center gap-1.5">
                  {t('navGetStarted')}
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative max-w-7xl w-full mx-auto px-6 pt-12 pb-16 text-center space-y-10 z-10 min-h-[calc(100vh-112px)] flex flex-col justify-center items-center">
        <div className="space-y-6 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-accent-cyan shadow-sm max-w-max mx-auto animate-float">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{t('heroBadge')}</span>
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.05] animate-slide-up" style={{ animationDelay: '80ms' }}>
            {t.rich('heroH1', {
              highlight: (chunks) => (
                <span className="bg-gradient-to-r from-accent-purple via-accent-pink to-accent-cyan bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-pan">
                  {chunks}
                </span>
              ),
            })}
          </h1>

          <p className="text-base md:text-lg text-dark-muted font-normal leading-relaxed max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '200ms' }}>
            {t('heroDesc')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 animate-slide-up" style={{ animationDelay: '320ms' }}>
            <Link href="/login" className="btn-press relative group overflow-hidden rounded-xl bg-gradient-to-r from-accent-purple to-accent-cyan p-[1px] font-bold text-sm w-full sm:w-auto shadow-2xl">
              <div className="bg-dark-bg group-hover:bg-transparent rounded-[11px] py-3.5 px-8 transition-all">
                <span className="flex items-center justify-center gap-2 text-white">
                  {t('heroCta1')}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
            <Link href="/pricing" className="btn-press px-8 py-4 rounded-xl text-sm font-bold bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all w-full sm:w-auto">
              {t('heroCta2')}
            </Link>
          </div>
        </div>

        {/* Dashboard Workspace Mockup Preview */}
        <div className="relative w-full max-w-5xl rounded-2xl border border-white/10 bg-white/[0.02] p-2.5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] backdrop-blur-md overflow-hidden group select-none mt-4 animate-scale-in" style={{ animationDelay: '440ms' }}>
          {/* Inner decorative mock layout */}
          <div className="rounded-xl bg-[#090a0f] p-4 grid grid-cols-12 gap-4 border border-white/5 text-left">
            {/* Sidebar mockup */}
            <div className="col-span-3 border-r border-white/5 pr-4 space-y-4 hidden md:block">
              <div className="flex items-center gap-1.5 pb-2 border-b border-white/5">
                <div className="h-5 w-5 rounded bg-accent-purple/20 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-accent-purple"></div>
                </div>
                <div className="h-3.5 w-16 bg-white/10 rounded"></div>
              </div>
              <div className="space-y-2">
                <div className="h-2.5 w-full bg-accent-purple/15 rounded border border-accent-purple/10"></div>
                <div className="h-2.5 w-5/6 bg-white/5 rounded"></div>
                <div className="h-2.5 w-4/5 bg-white/5 rounded"></div>
                <div className="h-2.5 w-11/12 bg-white/5 rounded"></div>
              </div>
            </div>

            {/* Bento Grid mockup (middle editor) */}
            <div className="col-span-12 md:col-span-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Carousel card */}
                <div className="h-24 bg-accent-purple/[0.03] border border-accent-purple/20 rounded-xl p-3 space-y-2.5">
                  <div className="flex justify-between items-center">
                    <div className="h-3.5 w-16 bg-accent-purple/20 rounded"></div>
                    <div className="h-3 w-5 bg-white/5 rounded"></div>
                  </div>
                  <div className="h-2 w-full bg-white/10 rounded shimmer"></div>
                  <div className="h-2 w-3/4 bg-white/5 rounded shimmer"></div>
                </div>
                {/* Post Studio card */}
                <div className="h-24 bg-accent-cyan/[0.03] border border-accent-cyan/20 rounded-xl p-3 space-y-2.5">
                  <div className="h-3.5 w-12 bg-accent-cyan/20 rounded"></div>
                  <div className="h-2 w-full bg-white/10 rounded shimmer"></div>
                  <div className="h-2 w-4/5 bg-white/5 rounded shimmer"></div>
                </div>
              </div>

              {/* Bottom wider element (Calendar/Analytics mock) */}
              <div className="h-20 bg-white/[0.01] border border-white/5 rounded-xl p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <div className="h-3.5 w-24 bg-white/10 rounded"></div>
                  <div className="h-3 w-10 bg-emerald-500/10 rounded"></div>
                </div>
                <div className="h-2 w-full bg-white/5 rounded"></div>
                <div className="h-2.5 w-5/6 bg-white/10 rounded"></div>
              </div>
            </div>

            {/* Smartphone Live Preview mockup */}
            <div className="col-span-12 md:col-span-3 flex justify-center items-center border-l border-white/5 pl-2">
              <div className="w-20 aspect-[9/19] bg-[#0c0d12] rounded-xl border border-white/15 p-1 flex flex-col justify-between items-stretch shadow-inner">
                <div className="h-0.5 w-5 bg-white/20 rounded-full mx-auto mt-0.5"></div>
                <div className="flex-1 my-1.5 rounded bg-[#090a0f] border border-white/5 p-1.5 flex flex-col justify-between">
                  <div className="h-1.5 w-1/2 bg-white/10 rounded"></div>
                  <div className="h-6 w-full bg-accent-purple/10 border border-accent-purple/20 rounded flex items-center justify-center">
                    <span className="text-[6px] text-accent-purple font-extrabold uppercase">SOLPRO</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded"></div>
                </div>
                <div className="h-0.5 w-6 bg-white/25 rounded-full mx-auto mb-0.5"></div>
              </div>
            </div>
          </div>
          {/* Neon radial glow behind mockup */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[150px] bg-gradient-to-r from-accent-purple to-accent-cyan opacity-25 blur-[70px] pointer-events-none group-hover:opacity-40 transition-opacity"></div>
        </div>

        {/* Customer Logo Section */}
        <div className="space-y-3 pt-6 w-full">
          <p className="text-[9px] tracking-widest font-extrabold text-dark-muted uppercase">{t('logosLabel')}</p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 opacity-25 select-none text-xs">
            <span className="font-display font-bold text-white tracking-widest">STRIPE</span>
            <span className="font-display font-bold text-white tracking-widest">LINEAR</span>
            <span className="font-display font-bold text-white tracking-widest">REFIRME</span>
            <span className="font-display font-bold text-white tracking-widest">APPLE</span>
            <span className="font-display font-bold text-white tracking-widest">FIGMA</span>
          </div>
        </div>
      </section>

      {/* Como Funciona Section */}
      <section id="como-funciona" className="max-w-7xl w-full mx-auto px-6 py-20 border-t border-white/5 space-y-12 relative z-10">
        <Reveal className="text-center space-y-2">
          <span className="text-[10px] tracking-widest font-extrabold text-accent-purple uppercase">{t('howSectionLabel')}</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white tracking-tight">{t('howTitle')}</h2>
          <p className="text-sm text-dark-muted max-w-lg mx-auto">{t('howDesc')}</p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {steps.map((item, index) => (
            <Reveal key={index} delay={index * 110} from="up" className="h-full">
              <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-white/[0.01] space-y-4 relative group hover:bg-[#10131e]/50 hover:-translate-y-1 transition-all text-left h-full">
                <span className="font-display text-4xl font-black bg-gradient-to-tr from-accent-purple to-accent-cyan bg-clip-text text-transparent opacity-80 group-hover:opacity-100 transition-opacity">
                  {item.step}
                </span>
                <h3 className="font-display text-base font-bold text-white">{item.title}</h3>
                <p className="text-xs text-dark-muted leading-relaxed">{item.desc}</p>

                {index < 3 && (
                  <div className="hidden md:block absolute top-12 -right-4 w-8 h-[1px] bg-gradient-to-r from-accent-purple/40 to-transparent z-20"></div>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Features Grid (Bento Style Preview) */}
      <section id="features" className="max-w-7xl w-full mx-auto px-6 py-20 border-t border-white/5 space-y-12 relative z-10">
        <Reveal className="text-center space-y-2">
          <span className="text-[10px] tracking-widest font-extrabold text-accent-cyan uppercase">{t('featSectionLabel')}</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white tracking-tight">{t('featTitle')}</h2>
          <p className="text-sm text-dark-muted max-w-lg mx-auto">{t('featDesc')}</p>
        </Reveal>

        {/* Features Bento Grid */}
        <Reveal from="up" className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Card 1: Smart Carousel Generator */}
          <div className="glass-panel bento-card p-6 rounded-3xl col-span-1 md:col-span-2 flex flex-col justify-between space-y-5 min-h-[380px]">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-accent-purple/10 border border-accent-purple/20 text-accent-purple rounded-xl">
                  <Zap className="h-5 w-5" />
                </div>
                <h3 className="font-display text-xl font-bold text-white">{t('card1Title')}</h3>
              </div>
              <p className="text-xs text-dark-muted leading-relaxed max-w-2xl">
                {t('card1Desc')}
              </p>
            </div>
            <div className="flex-1 min-h-[220px] bg-gradient-to-b from-white/[0.02] to-transparent rounded-2xl border border-white/5 flex items-center justify-center overflow-hidden relative shadow-inner">
              <AnimatedCarouselPreview />
            </div>
          </div>

          {/* Card 2: Adjustable Voice Tone */}
          <div className="glass-panel bento-card p-6 rounded-3xl col-span-1 flex flex-col justify-between space-y-4 min-h-[380px]">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan rounded-xl">
                  <BrainCircuit className="h-5 w-5" />
                </div>
                <h3 className="font-display text-xl font-bold text-white">{t('card2Title')}</h3>
              </div>
              <p className="text-xs text-dark-muted leading-relaxed">
                {t('card2Desc')}
              </p>
            </div>

            {/* Tone Simulator Widget */}
            <div className="flex-1 flex flex-col justify-between space-y-3 pt-2">
              {/* Tone Selection Grid */}
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(tonePreviews) as Array<keyof typeof tonePreviews>).map((tKey) => {
                  const item = tonePreviews[tKey];
                  const isActive = selectedTone === tKey;
                  return (
                    <button
                      key={tKey}
                      onClick={() => {
                        setSelectedTone(tKey);
                        setUserInteracted(true);
                      }}
                      className={`py-2 px-3 rounded-xl text-[10px] font-bold transition-all text-center border cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-r from-accent-purple/15 to-accent-cyan/15 border-accent-cyan/40 text-white shadow-[0_0_12px_rgba(6,182,212,0.15)] scale-[1.02]'
                          : 'bg-white/[0.02] border-white/5 text-dark-muted hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {item.title}
                    </button>
                  );
                })}
              </div>

              {/* Real Copy Preview Panel */}
              <div className="flex-1 bg-[#090a0f] border border-white/5 rounded-2xl p-3.5 flex flex-col justify-between relative shadow-lg overflow-hidden group/editor">
                {/* Editor Header */}
                <div className="flex justify-between items-center pb-2 border-b border-white/5 mb-2">
                  <span className="text-[7px] font-extrabold uppercase tracking-widest text-accent-cyan flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent-cyan animate-pulse"></span>
                    {t('editorLabel')}
                  </span>
                  <span className="text-[7px] font-extrabold uppercase bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-dark-muted">
                    {tonePreviews[selectedTone].badge}
                  </span>
                </div>

                {/* Editor Body */}
                <p className="text-[9px] text-white/90 leading-relaxed text-left whitespace-pre-line italic select-none font-medium flex-1 overflow-y-auto">
                  &ldquo;{tonePreviews[selectedTone].copy}&rdquo;
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: Brand Kit */}
          <div className="glass-panel bento-card p-6 rounded-3xl col-span-1 flex flex-col justify-between space-y-4 min-h-[380px]">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-accent-orange/10 border border-accent-orange/20 text-accent-orange rounded-xl">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="font-display text-xl font-bold text-white">{t('card3Title')}</h3>
              </div>
              <p className="text-xs text-dark-muted leading-relaxed">
                {t('card3Desc')}
              </p>
            </div>

            {/* Brand Kit Widget Mockup */}
            <div className="mt-auto space-y-4 pt-2">
              <div className="glass-panel bg-[#090a0f]/80 rounded-2xl p-4 border border-white/5 space-y-3 shadow-lg hover:border-accent-orange/20 transition-all duration-300">
                {/* Profile Mockup Header */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-accent-orange to-accent-pink p-[1.5px] shadow-[0_0_15px_rgba(249,115,22,0.15)]">
                      <div className="h-full w-full rounded-full bg-[#0c0d12] flex items-center justify-center text-xs font-bold text-white">MS</div>
                    </div>
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border border-[#090a0f] animate-pulse"></span>
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center gap-1">
                      <span className="font-display text-xs font-bold text-white">Marcelo Silva</span>
                      <span className="text-[10px] text-accent-orange font-bold">✓</span>
                    </div>
                    <p className="text-[9px] text-dark-muted truncate">@marcelo.growth</p>
                  </div>
                  <span className="text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-accent-orange/10 border border-accent-orange/20 text-accent-orange tracking-wider">
                    {t('kitActive')}
                  </span>
                </div>

                {/* Palette circles */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div className="flex flex-col gap-0.5 text-left">
                    <span className="text-[7px] text-dark-muted uppercase font-bold tracking-widest">{t('palette')}</span>
                    <span className="text-[9px] font-medium text-white/90">{t('paletteTheme')}</span>
                  </div>
                  <div className="flex gap-1.5">
                    {['#8b5cf6', '#06b6d4', '#f43f5e', '#f97316'].map((color, idx) => (
                      <div
                        key={idx}
                        className="group/color relative h-4 w-4 rounded-full border border-white/15 cursor-pointer hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                      >
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover/color:block bg-black text-white text-[6px] px-1 py-0.5 rounded font-mono border border-white/10 z-30">
                          {color}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Watermark toggle mock */}
                <div className="flex items-center justify-between text-[9px] pt-1.5">
                  <span className="text-white/85 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent-orange"></span>
                    {t('watermark')}
                  </span>
                  <div className="h-4.5 w-8 rounded-full bg-accent-orange/20 border border-accent-orange/40 p-0.5 flex items-center justify-end cursor-pointer">
                    <div className="h-3 w-3 rounded-full bg-accent-orange shadow-md"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Calendar & Analytics */}
          <div className="glass-panel bento-card p-6 rounded-3xl col-span-1 md:col-span-2 flex flex-col justify-between space-y-5 min-h-[380px]">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan rounded-xl">
                  <BrainCircuit className="h-5 w-5" />
                </div>
                <h3 className="font-display text-xl font-bold text-white">{t('card4Title')}</h3>
              </div>
              <p className="text-xs text-dark-muted leading-relaxed max-w-2xl">
                {t('card4Desc')}
              </p>
            </div>

            {/* Split Layout Container */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch pt-2">

              {/* Left Column: Weekly Planner */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-3 bg-gradient-to-b from-white/[0.02] to-transparent rounded-2xl border border-white/5 p-4 relative shadow-inner">
                <div className="space-y-1 text-left">
                  <span className="text-[8px] font-extrabold uppercase text-accent-cyan tracking-wider">{t('schedLabel')}</span>
                  <h4 className="text-xs font-bold text-white">{t('schedTitle')}</h4>
                </div>

                <div className="space-y-2 flex-1 flex flex-col justify-center">
                  {scheduleItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-[#10131e]/50 hover:border-white/10 transition-all text-[10px] cursor-pointer">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-extrabold text-[9px] w-6 text-center text-dark-muted">{item.day}</span>
                        <div className="h-1.5 w-1.5 rounded-full bg-accent-cyan"></div>
                        <div className="flex flex-col text-left">
                          <span className="font-bold text-white leading-none truncate max-w-[125px]">{item.title}</span>
                          <span className="text-[8px] text-dark-muted mt-0.5">{item.platform} • {item.type}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] text-dark-muted font-medium">{item.time}</span>
                        <span className={`text-[7px] font-extrabold uppercase px-1.5 py-0.5 rounded border tracking-wider leading-none ${item.statusColor}`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Chart */}
              <div className="lg:col-span-7 bg-[#090a0f] rounded-2xl border border-white/5 flex items-center justify-center overflow-hidden p-4 shadow-lg">
                <AnimatedChart />
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Pricing Section ── */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <Reveal>
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-accent-cyan mx-auto">
                <Zap className="h-3.5 w-3.5" />
                <span>Planos e Preços</span>
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Simples. Transparente.{' '}
                <span className="bg-gradient-to-r from-accent-purple to-accent-cyan bg-clip-text text-transparent">
                  Sem surpresas.
                </span>
              </h2>
              <p className="text-sm text-dark-muted max-w-lg mx-auto">
                Cancele ou mude de plano a qualquer momento. Sem contratos longos.
              </p>
            </div>
          </Reveal>

          <Reveal>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
              {[
                {
                  name: 'Starter Creator', price: 0, recommended: false,
                  desc: 'Para explorar a plataforma',
                  features: ['Geração de texto com IA', 'Até 3 slides por carrossel', '1 Brand Kit', 'Preview de redes sociais'],
                  cta: 'Começar Grátis', planId: 'starter',
                },
                {
                  name: 'Pro Creator', price: 29, recommended: true,
                  desc: 'Para criadores sérios',
                  features: ['25 carrosséis/mês com IA', 'Carrosséis de até 8 slides', 'Imagens geradas por IA', 'Tons de voz avançados', 'Banco de Ideias Virais', 'Calendário editorial + Analytics'],
                  cta: 'Assinar Pro', planId: 'pro',
                },
                {
                  name: 'Agency Scale', price: 79, recommended: false,
                  desc: 'Para agências e equipes',
                  features: ['60 carrosséis/mês com IA', 'Tudo do Pro', 'Brand Kits ilimitados', 'Exportação Figma/PDF', 'Análise de concorrentes', 'Gerente de conta dedicado'],
                  cta: 'Assinar Agency', planId: 'agency',
                },
              ].map((plan) => (
                <div key={plan.planId}
                  className={`glass-panel rounded-3xl p-8 border flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:-translate-y-1.5 ${
                    plan.recommended
                      ? 'border-accent-purple bg-accent-purple/[0.03] shadow-[0_20px_50px_rgba(139,92,246,0.15)] scale-105 z-10'
                      : 'border-white/5 bg-white/[0.01]'
                  }`}
                >
                  {plan.recommended && (
                    <div className="absolute top-0 right-10 left-10 h-[1px] bg-gradient-to-r from-transparent via-accent-purple to-transparent blur-sm" />
                  )}
                  <div className="space-y-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-display text-lg font-bold text-white">{plan.name}</h3>
                        <p className="text-[11px] text-dark-muted mt-1">{plan.desc}</p>
                      </div>
                      {plan.recommended && (
                        <span className="text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-accent-purple/20 border border-accent-purple/40 text-accent-purple tracking-wider">
                          Recomendado
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline text-white">
                      {plan.price > 0 && <span className="text-sm font-bold">USD$</span>}
                      <span className="text-4xl font-extrabold tracking-tight font-display">
                        {plan.price === 0 ? 'Grátis' : plan.price}
                      </span>
                      {plan.price > 0 && <span className="text-xs text-dark-muted ml-1">/mês</span>}
                    </div>
                    <hr className="border-white/5" />
                    <ul className="space-y-3">
                      {plan.features.map(f => (
                        <li key={f} className="flex items-start gap-2.5 text-xs text-dark-muted">
                          <Check className="h-4 w-4 text-accent-cyan flex-shrink-0 mt-0.5" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="pt-8">
                    <button
                      onClick={() => router.push(`/login?plan=${plan.planId}`)}
                      className={`w-full py-3.5 rounded-xl text-xs font-bold transition-all ${
                        plan.recommended
                          ? 'bg-gradient-to-r from-accent-purple to-accent-cyan text-white shadow-lg hover:shadow-[0_0_20px_rgba(139,92,246,0.4)]'
                          : 'bg-white/5 hover:bg-white/10 border border-white/10 text-white'
                      }`}
                    >
                      {plan.cta}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}
