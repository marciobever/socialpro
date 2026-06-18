"use client";
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, BrainCircuit, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { Reveal } from '@/components/landing/Reveal';
import { AnimatedCarouselPreview } from '@/components/landing/AnimatedCarouselPreview';
import { AnimatedChart } from '@/components/landing/AnimatedChart';

export default function LandingPage() {
  const router = useRouter();

  // Tone selector state for Bento Card 2
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
      title: "🌶️ Provocativo",
      copy: "97% dos criadores do LinkedIn vão falhar em 2026. A culpa não é da inteligência artificial, mas sim da preguiça de criar ganchos fortes. Se você continua postando blocos de texto sem fricção, sinto muito: você está escrevendo no vazio. Comente 'QUERO' para receber o segredo.",
      badge: "Quebra de padrão"
    },
    autoridade: {
      title: "👔 Autoridade",
      copy: "Analisamos mais de 1.200 carrosséis no Instagram durante o Q1 de 2026. Os dados mostram que slides com densidade de informação reduzida e fontes de exibição (ex: Outfit Bold) retêm o leitor por 42% mais tempo. Aqui está o checklist exato da nossa metodologia de design.",
      badge: "Estudo de caso"
    },
    storyteller: {
      title: "📖 Storyteller",
      copy: "Em 2024, eu passei 3 meses criando posts todos os dias. O resultado? Zero clientes e 15 curtidas por post. Eu estava prestes a desistir quando percebi que o que conecta não é o seu sucesso, mas o seu processo de superação. Foi aí que decidi mudar a narrativa. Veja como funcionou.",
      badge: "Jornada pessoal"
    },
    meme: {
      title: "⚡ Meme",
      copy: "Eu prometendo para mim mesmo que vou dormir cedo no domingo para começar a semana descansado 😴\n\nEu no mesmo domingo, às 3h45 da manhã, viciado criando carrosséis e refinando copys com a IA da SocialPro 🤡",
      badge: "Humor & Conexão"
    }
  };

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
              <a href="#como-funciona" className="hover:text-white transition-colors">Como Funciona</a>
              <a href="#features" className="hover:text-white transition-colors">Funcionalidades</a>
              <Link href="/pricing" className="hover:text-white transition-colors">Preços</Link>
            </nav>

            <div className="flex items-center gap-4">
              <Link href="/login" className="text-xs font-bold hover:text-white transition-colors text-dark-muted">Entrar</Link>
              <Link href="/login" className="relative group overflow-hidden rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-black hover:text-white border border-white/10">
                <div className="absolute inset-0 -z-10 bg-gradient-to-r from-accent-purple to-accent-cyan opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="flex items-center gap-1.5">
                  Começar Grátis
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
            <span>Nova atualização: IA v2.0 ativa com suporte a carrosséis</span>
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.05] animate-slide-up" style={{ animationDelay: '80ms' }}>
            A ferramenta secreta dos maiores <span className="bg-gradient-to-r from-accent-purple via-accent-pink to-accent-cyan bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-pan">criadores</span> do LinkedIn & Instagram.
          </h1>

          <p className="text-base md:text-lg text-dark-muted font-normal leading-relaxed max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '200ms' }}>
            Crie carrosséis cinematográficos, copys altamente persuasivas baseadas em psicologia de consumo e gerencie todo o seu calendário editorial com a inteligência artificial mais potente do mercado.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 animate-slide-up" style={{ animationDelay: '320ms' }}>
            <Link href="/login" className="btn-press relative group overflow-hidden rounded-xl bg-gradient-to-r from-accent-purple to-accent-cyan p-[1px] font-bold text-sm w-full sm:w-auto shadow-2xl">
              <div className="bg-dark-bg group-hover:bg-transparent rounded-[11px] py-3.5 px-8 transition-all">
                <span className="flex items-center justify-center gap-2 text-white">
                  Iniciar Estúdio Grátis
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
            <Link href="/pricing" className="btn-press px-8 py-4 rounded-xl text-sm font-bold bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all w-full sm:w-auto">
              Ver Planos Premium
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
          <p className="text-[9px] tracking-widest font-extrabold text-dark-muted uppercase">Criando conteúdo com velocidade de escala</p>
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
          <span className="text-[10px] tracking-widest font-extrabold text-accent-purple uppercase">Fluxo de Trabalho</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white tracking-tight">Criar posts magnéticos é simples</h2>
          <p className="text-sm text-dark-muted max-w-lg mx-auto">Domine o algoritmo de redes sociais seguindo estes 4 passos práticos no nosso estúdio.</p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { step: '01', title: 'Configure seu Perfil', desc: 'Defina sua identidade, nicho e contexto de negócios. A IA aprende o seu tom de voz em segundos.' },
            { step: '02', title: 'Escolha o Modelo', desc: 'Selecione uma estrutura de alto engajamento no banco de ideias virais e defina o tom ideal do post.' },
            { step: '03', title: 'Refine com IA', desc: 'Insira seu rascunho bruto e deixe a IA gerar o roteiro dos slides e a copy otimizada para o algoritmo.' },
            { step: '04', title: 'Visualize & Agende', desc: 'Pré-visualize o post em tempo real no mockup de celular e agende a publicação direto no calendário.' }
          ].map((item, index) => (
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
          <span className="text-[10px] tracking-widest font-extrabold text-accent-cyan uppercase">Estética & Inteligência</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white tracking-tight">Recursos magnéticos para criadores de elite</h2>
          <p className="text-sm text-dark-muted max-w-lg mx-auto">Deixe a IA estruturar suas ideias enquanto você foca no branding e no engajamento.</p>
        </Reveal>

        {/* Features Bento Grid */}
        <Reveal from="up" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Gerador de Carrosséis Inteligentes */}
          <div className="glass-panel bento-card p-6 rounded-3xl col-span-1 md:col-span-2 flex flex-col justify-between space-y-5 min-h-[380px]">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-accent-purple/10 border border-accent-purple/20 text-accent-purple rounded-xl">
                  <Zap className="h-5 w-5" />
                </div>
                <h3 className="font-display text-xl font-bold text-white">Gerador de Carrosséis Inteligentes</h3>
              </div>
              <p className="text-xs text-dark-muted leading-relaxed max-w-2xl">
                Escreva ideias brutas e deixe o sistema desenhar e ordenar os slides. Escolha entre gradientes cinematográficos e estruturas validadas pelo algoritmo que mantêm o leitor deslizando até a última página.
              </p>
            </div>
            <div className="flex-1 min-h-[220px] bg-gradient-to-b from-white/[0.02] to-transparent rounded-2xl border border-white/5 flex items-center justify-center overflow-hidden relative shadow-inner">
              <AnimatedCarouselPreview />
            </div>
          </div>

          {/* Card 2: Tom de Voz Ajustável */}
          <div className="glass-panel bento-card p-6 rounded-3xl col-span-1 flex flex-col justify-between space-y-4 min-h-[380px]">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan rounded-xl">
                  <BrainCircuit className="h-5 w-5" />
                </div>
                <h3 className="font-display text-xl font-bold text-white">Tom de Voz Ajustável</h3>
              </div>
              <p className="text-xs text-dark-muted leading-relaxed">
                Ajuste as diretrizes da IA com quatro modos e veja o estilo de escrita da legenda se transformar em tempo real no simulador abaixo.
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
                    Legenda Refinada
                  </span>
                  <span className="text-[7px] font-extrabold uppercase bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-dark-muted">
                    {tonePreviews[selectedTone].badge}
                  </span>
                </div>
                
                {/* Editor Body */}
                <p className="text-[9px] text-white/90 leading-relaxed text-left whitespace-pre-line italic select-none font-medium flex-1 overflow-y-auto">
                  "{tonePreviews[selectedTone].copy}"
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: Brand Kit Integrado */}
          <div className="glass-panel bento-card p-6 rounded-3xl col-span-1 flex flex-col justify-between space-y-4 min-h-[380px]">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-accent-orange/10 border border-accent-orange/20 text-accent-orange rounded-xl">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="font-display text-xl font-bold text-white">Brand Kit Integrado</h3>
              </div>
              <p className="text-xs text-dark-muted leading-relaxed">
                Configure seu nome, avatar fictício e handle de redes sociais de forma global. A IA insere esses dados em todos os mockups gerados em tempo real.
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
                    Kit Ativo
                  </span>
                </div>

                {/* Palette circles */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div className="flex flex-col gap-0.5 text-left">
                    <span className="text-[7px] text-dark-muted uppercase font-bold tracking-widest">Paleta de Cores</span>
                    <span className="text-[9px] font-medium text-white/90">Cinematic Neon</span>
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
                    Marca d'água automática nos slides
                  </span>
                  <div className="h-4.5 w-8 rounded-full bg-accent-orange/20 border border-accent-orange/40 p-0.5 flex items-center justify-end cursor-pointer">
                    <div className="h-3 w-3 rounded-full bg-accent-orange shadow-md"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Calendário & Analytics de Alta Fidelidade */}
          <div className="glass-panel bento-card p-6 rounded-3xl col-span-1 md:col-span-2 flex flex-col justify-between space-y-5 min-h-[380px]">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan rounded-xl">
                  <BrainCircuit className="h-5 w-5" />
                </div>
                <h3 className="font-display text-xl font-bold text-white">Calendário & Analytics de Alta Fidelidade</h3>
              </div>
              <p className="text-xs text-dark-muted leading-relaxed max-w-2xl">
                Monitore sua consistência semanal através do planejador minimalista e avalie o engajamento estimado das postagens com o gráfico de linhas interativo em SVG.
              </p>
            </div>

            {/* Split Layout Container */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch pt-2">
              
              {/* Left Column: Weekly Planner */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-3 bg-gradient-to-b from-white/[0.02] to-transparent rounded-2xl border border-white/5 p-4 relative shadow-inner">
                <div className="space-y-1 text-left">
                  <span className="text-[8px] font-extrabold uppercase text-accent-cyan tracking-wider">Cronograma Semanal</span>
                  <h4 className="text-xs font-bold text-white">Posts agendados para a semana</h4>
                </div>
                
                <div className="space-y-2 flex-1 flex flex-col justify-center">
                  {[
                    { day: 'Seg', type: 'Post', platform: 'LinkedIn', title: 'Framework de Escala v2', time: '09:00', status: 'publicado', statusColor: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
                    { day: 'Qua', type: 'Carrossel', platform: 'Instagram', title: 'O Gancho Perfeito', time: '18:00', status: 'agendado', statusColor: 'bg-accent-purple/10 border-accent-purple/20 text-accent-purple' },
                    { day: 'Sex', type: 'Thread', platform: 'X/Twitter', title: 'Como sair do zero aos $10k', time: '12:00', status: 'rascunho', statusColor: 'bg-white/5 border-white/10 text-dark-muted' }
                  ].map((item, index) => (
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

      {/* Footer */}
      <footer className="w-full py-8 border-t border-white/5 bg-[#050609] text-center text-xs text-dark-muted relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-4 w-4 text-accent-purple" />
            <span className="font-semibold text-white">SocialPro AI Inc.</span>
          </div>
          <p>© 2026 SocialPro. Todos os direitos reservados. Design inspirado em Linear & Refirme.</p>
        </div>
      </footer>
    </div>
  );
}
