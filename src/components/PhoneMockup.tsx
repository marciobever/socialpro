import React, { useState, useEffect, useRef } from 'react';
import type { PlatformType, Slide, CarouselStyleModel, WatermarkType } from '../types';
import { Heart, MessageCircle, Share2, Bookmark, Send, Globe, ChevronLeft, ChevronRight, Cpu } from 'lucide-react';
import { Twitter } from './icons';

interface PhoneMockupProps {
  platform: PlatformType;
  content: string;
  slides: Slide[];
  activeSlideIndex: number;
  onSetActiveSlide: (index: number) => void;
  styleModel: CarouselStyleModel;
  watermarkType: WatermarkType;
  brandName: string;
  brandHandle: string;
  avatarUrl: string;
}

export const PhoneMockup: React.FC<PhoneMockupProps> = ({
  platform,
  content,
  slides,
  activeSlideIndex,
  onSetActiveSlide,
  styleModel,
  watermarkType,
  brandName,
  brandHandle,
  avatarUrl,
}) => {
  const currentSlide = slides[activeSlideIndex] || slides[0];
  const isCurrentGenerating = !!(currentSlide?.isGeneratingImage && !currentSlide?.imageUrl);

  // Elapsed-seconds timer — resets per slide and per generation cycle
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isCurrentGenerating) {
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
    } else {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [currentSlide?.id, isCurrentGenerating]);

  const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const handlePrevSlide = () => {
    if (activeSlideIndex > 0) {
      onSetActiveSlide(activeSlideIndex - 1);
    }
  };

  const handleNextSlide = () => {
    if (activeSlideIndex < slides.length - 1) {
      onSetActiveSlide(activeSlideIndex + 1);
    }
  };

  const getSlideStyle = (): React.CSSProperties => {
    switch (styleModel) {
      case 'lifestyle':
        return {
          backgroundImage: `linear-gradient(to bottom, rgba(7,8,12,0.4) 0%, rgba(7,8,12,0.85) 100%), url(https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600&h=750)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        };
      case 'tech':
        return { background: 'radial-gradient(circle at top right, #8b5cf6 0%, #06b6d4 100%)' };
      case 'alert':
        return { background: 'linear-gradient(135deg, #1e0505 0%, #450a0a 50%, #7f1d1d 100%)' };
      case 'feminino':
        return { background: 'linear-gradient(135deg, #831843 0%, #be185d 50%, #f43f5e 100%)' };
      case 'neutro':
        return { background: 'linear-gradient(135deg, #292524 0%, #44403c 50%, #78716c 100%)' };
      case 'retro':
        return { background: 'linear-gradient(135deg, #451a03 0%, #92400e 50%, #b45309 100%)' };
      case 'pixar':
        return { background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #7c3aed 100%)' };
      case 'anime':
        return { background: 'linear-gradient(135deg, #4a044e 0%, #be185d 50%, #f97316 100%)' };
      case 'aquarela':
        return { background: 'linear-gradient(135deg, #164e63 0%, #0e7490 50%, #0d9488 100%)' };
      case 'flat':
        return { background: 'linear-gradient(135deg, #064e3b 0%, #0d9488 50%, #1d4ed8 100%)' };
      case 'cartoon':
        return { background: 'linear-gradient(135deg, #7f1d1d 0%, #c2410c 50%, #ca8a04 100%)' };
      case 'infantil':
        return { background: 'linear-gradient(135deg, #ea580c 0%, #eab308 50%, #22c55e 100%)' };
      case 'neon':
        return { background: 'linear-gradient(135deg, #180325 0%, #31054a 50%, #00d2ff 100%)' };
      default:
        return { background: 'linear-gradient(135deg, #0b0c10 0%, #171923 100%)' };
    }
  };

  const SLIDE_ANIM_CLASS: Record<CarouselStyleModel, string> = {
    lifestyle: 'slide-anim-lifestyle',
    tech:      'slide-anim-tech',
    alert:     'slide-anim-alert',
    minimalist:'slide-anim-minimalist',
    feminino:  'slide-anim-lifestyle',
    neutro:    'slide-anim-minimalist',
    retro:     'slide-anim-lifestyle',
    neon:      'slide-anim-tech',
    // Avatar / Illustration styles
    infantil:  'slide-anim-minimalist',
    pixar:     'slide-anim-lifestyle',
    anime:     'slide-anim-tech',
    aquarela:  'slide-anim-lifestyle',
    flat:      'slide-anim-minimalist',
    cartoon:   'slide-anim-minimalist',
  };

  return (
    <div className="relative mx-auto max-w-[340px] w-full aspect-[9/19] rounded-[48px] bg-[#0c0d12] p-3.5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] border border-white/10 group select-none keep-dark">
      {/* Notch / Dynamic Island */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-30 flex items-center justify-center border border-white/5">
        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500/80 mr-2"></div>
        <div className="h-1.5 w-1.5 rounded-full bg-blue-900/60"></div>
      </div>

      {/* Screen Frame */}
      <div className="relative h-full w-full rounded-[38px] bg-[#090a0f] border border-white/5 overflow-hidden flex flex-col justify-between p-4 pt-12">
        {/* Status Bar */}
        <div className="absolute top-2 left-6 right-6 flex justify-between items-center text-[10px] text-white/50 font-bold z-20">
          <span>09:41</span>
          <div className="flex items-center gap-1">
            <span>5G</span>
            <div className="w-4 h-2 rounded bg-white/50 border border-white/10"></div>
          </div>
        </div>

        {/* Dynamic App Feed Area */}
        <div className="flex-1 flex flex-col justify-start overflow-y-auto pt-2 scrollbar-none">
          {/* LinkedIn Mockup */}
          {platform === 'linkedin' && (
            <div className="bg-[#11131c] border border-white/5 rounded-2xl p-4 space-y-3 shadow-lg">
              {/* Post Header */}
              <div className="flex items-start gap-2.5">
                <img 
                  src={avatarUrl} 
                  alt="Avatar"
                  className="h-10 w-10 rounded-full border border-white/10 object-cover"
                />
                <div className="overflow-hidden">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-xs text-white">{brandName}</span>
                    <span className="text-[10px] text-dark-muted">• 1º</span>
                  </div>
                  <p className="text-[9px] text-dark-muted truncate leading-tight">Criador de Conteúdo | SocialPro AI Engine</p>
                  <div className="flex items-center gap-1 text-[8px] text-dark-muted mt-0.5">
                    <span>1h</span>
                    <span>•</span>
                    <Globe className="h-2.5 w-2.5" />
                  </div>
                </div>
              </div>

              {/* Post Content */}
              <div className="text-[11px] leading-relaxed text-white/90 whitespace-pre-line break-words">
                {content || "Edite o conteúdo no Post Studio para ver a mágica acontecer aqui em tempo real..."}
              </div>

              {/* Post Interaction Stats */}
              <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[9px] text-dark-muted">
                <span>👍 1.250 reações</span>
                <span>• 84 comentários</span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-4 gap-1 pt-1 border-t border-white/5 text-[9px] text-dark-muted font-bold text-center">
                <button className="flex flex-col items-center py-1 hover:text-white transition-colors">
                  <span className="text-xs">👍</span> Gostei
                </button>
                <button className="flex flex-col items-center py-1 hover:text-white transition-colors">
                  <span className="text-xs">💬</span> Comentar
                </button>
                <button className="flex flex-col items-center py-1 hover:text-white transition-colors">
                  <span className="text-xs">🔄</span> Compartilhar
                </button>
                <button className="flex flex-col items-center py-1 hover:text-white transition-colors">
                  <span className="text-xs">✉️</span> Enviar
                </button>
              </div>
            </div>
          )}

          {/* X / Twitter Mockup */}
          {platform === 'x' && (
            <div className="bg-[#000000] border border-white/5 rounded-2xl p-4 space-y-3 shadow-lg">
              {/* Author header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <img 
                    src={avatarUrl} 
                    alt="Avatar"
                    className="h-10 w-10 rounded-full border border-white/10 object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-xs text-white">{brandName}</h4>
                    <span className="text-[10px] text-dark-muted block">{brandHandle}</span>
                  </div>
                </div>
                <Twitter className="h-4 w-4 text-white/40" />
              </div>

              {/* Tweet Content */}
              <div className="text-[11px] leading-relaxed text-white/95 whitespace-pre-line break-words">
                {content || "Escreva um tweet instigante no Post Studio..."}
              </div>

              {/* Time Stamp */}
              <div className="text-[9px] text-dark-muted pt-1 border-b border-white/5 pb-2">
                <span>09:41 AM · Jun 8, 2026</span>
              </div>

              {/* Interaction icons */}
              <div className="flex justify-between items-center px-2 text-dark-muted">
                <button className="flex items-center gap-1 hover:text-sky-400 transition-colors">
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span className="text-[9px]">42</span>
                </button>
                <button className="flex items-center gap-1 hover:text-emerald-400 transition-colors">
                  <Share2 className="h-3.5 w-3.5" />
                  <span className="text-[9px]">18</span>
                </button>
                <button className="flex items-center gap-1 hover:text-rose-500 transition-colors">
                  <Heart className="h-3.5 w-3.5" />
                  <span className="text-[9px]">892</span>
                </button>
                <button className="flex items-center gap-1 hover:text-sky-400 transition-colors">
                  <Bookmark className="h-3.5 w-3.5" />
                  <span className="text-[9px]">98</span>
                </button>
              </div>
            </div>
          )}

          {/* Instagram Carousel Mockup */}
          {platform === 'instagram' && (
            <div className="bg-[#0b0c10] border border-white/5 rounded-2xl overflow-hidden shadow-lg">
              {/* Header */}
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-2">
                  <img 
                    src={avatarUrl} 
                    alt="Avatar"
                    className="h-8 w-8 rounded-full border border-white/15 object-cover"
                  />
                  <div>
                    <span className="font-bold text-[10px] text-white">{brandHandle.replace('@', '')}</span>
                    <span className="text-[8px] text-dark-muted block">Original Audio</span>
                  </div>
                </div>
                <span className="text-white text-xs font-bold">•••</span>
              </div>

              {/* Interactive Carousel Frame */}
              <div
                className={`relative w-full aspect-square bg-[#0c0d12] flex flex-col justify-between text-white overflow-hidden p-5 select-none ${currentSlide?.imageUrl ? '' : SLIDE_ANIM_CLASS[styleModel]}`}
                style={currentSlide?.imageUrl ? {} : getSlideStyle()}
              >
                {/* Generated image background */}
                {currentSlide?.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={currentSlide.id}
                    src={currentSlide.imageUrl}
                    alt={currentSlide.title}
                    className="absolute inset-0 w-full h-full object-cover animate-fade-in"
                  />
                )}

                {/* Loading overlay with timer — shown while Windmill generates */}
                {isCurrentGenerating && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center overflow-hidden">
                    {/* Animated background layers */}
                    <div className="absolute inset-0 bg-[#070810]" />
                    <div className="absolute inset-0 animate-pulse"
                      style={{ background: 'radial-gradient(ellipse at 30% 40%, rgba(139,92,246,0.25) 0%, transparent 60%)' }} />
                    <div className="absolute inset-0 animate-pulse" style={{ animationDelay: '0.7s',
                      background: 'radial-gradient(ellipse at 70% 60%, rgba(6,182,212,0.2) 0%, transparent 60%)' }} />
                    {/* Moving scanline */}
                    <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-purple/60 to-transparent animate-bounce"
                      style={{ top: `${40 + (elapsed % 3) * 10}%`, transition: 'top 1s ease-in-out' }} />

                    {/* Center content */}
                    <div className="relative flex flex-col items-center gap-2 z-10">
                      {/* Spinning ring */}
                      <div className="relative h-10 w-10">
                        <div className="absolute inset-0 rounded-full border-2 border-accent-purple/20" />
                        <div className="absolute inset-0 rounded-full border-2 border-t-accent-purple border-r-accent-cyan border-b-transparent border-l-transparent animate-spin" />
                        <div className="absolute inset-1.5 flex items-center justify-center">
                          <Cpu className="h-3.5 w-3.5 text-accent-cyan opacity-80" />
                        </div>
                      </div>

                      {/* Timer */}
                      <div className="text-center">
                        <span className="text-[18px] font-black text-white tabular-nums leading-none tracking-tighter">
                          {fmtTime(elapsed)}
                        </span>
                      </div>

                      {/* Status text */}
                      <div className="text-center space-y-0.5">
                        <p className="text-[7px] font-bold text-accent-cyan uppercase tracking-widest animate-pulse">
                          Windmill gerando
                        </p>
                        <p className="text-[6px] text-white/40 font-medium">
                          gpt-image-2 · slide {activeSlideIndex + 1}/{slides.length}
                        </p>
                      </div>

                      {/* Dot progress indicators */}
                      <div className="flex gap-1 mt-1">
                        {slides.map((s, i) => (
                          <span key={i} className={`h-1 rounded-full transition-all duration-500 ${
                            s.imageUrl
                              ? 'w-3 bg-emerald-400'
                              : s.isGeneratingImage
                                ? 'w-3 bg-accent-purple animate-pulse'
                                : 'w-1 bg-white/20'
                          }`} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Alert Warning Header overlay (only without AI image) */}
                {!currentSlide?.imageUrl && styleModel === 'alert' && (
                  <div className="absolute top-8 left-0 right-0 bg-yellow-500 text-black py-0.5 px-3 text-[6px] font-extrabold uppercase tracking-wider text-center shadow-md rotate-[-4deg] scale-105 z-20">
                    ⚠️ ALERTA DE SEGURANÇA / ATENÇÃO
                  </div>
                )}

                {/* Decorative glow if Tech (only without AI image) */}
                {!currentSlide?.imageUrl && styleModel === 'tech' && (
                  <div className="absolute -top-12 -right-12 h-24 w-24 rounded-full bg-white/10 blur-xl"></div>
                )}

                {/* Top Branding (always visible) */}
                <div className="flex justify-between items-center w-full z-10">
                  <span className="text-[8px] font-black tracking-widest uppercase bg-black/30 backdrop-blur-md px-1.5 py-0.5 rounded border border-white/5">
                    SOLPRO.AI
                  </span>
                  <span className="text-[8px] font-bold bg-black/30 backdrop-blur-md px-1.5 py-0.5 rounded border border-white/5">
                    {activeSlideIndex + 1} / {slides.length}
                  </span>
                </div>

                {/* Text overlay — only when no AI image */}
                {!currentSlide?.imageUrl && (
                <div key={currentSlide?.id} className="space-y-1 py-3 z-10 text-left animate-slide-swap">
                  <h4 className="font-display font-black text-xs uppercase leading-tight tracking-tight drop-shadow-lg">
                    {currentSlide?.title || 'Título Principal'}
                  </h4>
                  <p className="text-[9px] text-white/90 leading-relaxed font-light drop-shadow-md">
                    {currentSlide?.subtitle || 'Insira as informações de valor neste slide.'}
                  </p>

                  {styleModel === 'lifestyle' && activeSlideIndex === 0 && (
                    <div className="mt-2.5 bg-black/40 border border-white/10 p-1.5 rounded-lg flex items-center gap-1.5 max-w-[140px] shadow-lg animate-float">
                      <div className="h-5 w-3.5 bg-[#090a0f] rounded border border-white/10 flex items-center justify-center text-[4px] text-accent-pink font-bold">❌</div>
                      <div className="space-y-0.5">
                        <div className="h-1 w-8 bg-accent-pink/20 rounded"></div>
                        <div className="h-0.5 w-10 bg-white/10 rounded"></div>
                      </div>
                    </div>
                  )}
                </div>
                )}

                {/* Bottom navigation & profile chip */}
                <div className="space-y-2 z-10">
                  {/* Floating Creator Chip - Watermark */}
                  {watermarkType !== 'none' && (
                    <div className="flex justify-center">
                      <div className="flex items-center gap-1 bg-black/50 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded-full shadow-lg">
                        <img 
                          src={avatarUrl} 
                          alt="Avatar"
                          className="h-4 w-4 rounded-full object-cover border border-white/20"
                        />
                        <div className="flex flex-col text-[6px] leading-none text-left">
                          {watermarkType === 'both' ? (
                            <>
                              <span className="font-bold text-white">{brandName}</span>
                              <span className="text-[5px] text-dark-muted">{brandHandle}</span>
                            </>
                          ) : (
                            <span className="font-bold text-white">{brandHandle}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center w-full">
                    <div className="flex gap-1">
                      {slides.map((_, idx) => (
                        <span 
                          key={idx}
                          className={`h-0.5 rounded-full transition-all ${
                            idx === activeSlideIndex ? 'w-2.5 bg-white' : 'w-0.5 bg-white/40'
                          }`}
                        />
                      ))}
                    </div>
                    {styleModel === 'lifestyle' ? (
                      <span className="text-[6px] tracking-wider font-extrabold text-white/95 uppercase">
                        Ver próximo passo &gt;&gt;&gt;
                      </span>
                    ) : (
                      <span className="text-[6px] tracking-wider font-semibold opacity-70">
                        Deslize
                      </span>
                    )}
                  </div>
                </div>

                {/* Arrow navigation on hover */}
                <div className="absolute inset-y-0 left-0 right-0 flex justify-between items-center px-1 opacity-0 hover:opacity-100 transition-opacity z-20">
                  <button 
                    onClick={handlePrevSlide} 
                    disabled={activeSlideIndex === 0} 
                    className="p-1 rounded-full bg-black/30 border border-white/10 hover:bg-black/50 text-white disabled:opacity-20"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <button 
                    onClick={handleNextSlide} 
                    disabled={activeSlideIndex === slides.length - 1} 
                    className="p-1 rounded-full bg-black/30 border border-white/10 hover:bg-black/50 text-white disabled:opacity-20"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Feed Actions */}
              <div className="p-3 space-y-2 text-left">
                <div className="flex justify-between items-center text-white">
                  <div className="flex gap-3">
                    <Heart className="h-4 w-4 hover:text-rose-500 transition-colors" />
                    <MessageCircle className="h-4 w-4 hover:text-sky-400 transition-colors" />
                    <Send className="h-4 w-4 hover:text-emerald-400 transition-colors" />
                  </div>
                  <Bookmark className="h-4 w-4 hover:text-yellow-400 transition-colors" />
                </div>
                {/* Captions */}
                <div className="text-[10px] text-white/90 leading-tight">
                  <span className="font-bold mr-1">{brandHandle.replace('@', '')}</span>
                  <span className="whitespace-pre-wrap">{content || "Legenda do post no Instagram..."}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Home Indicator bar */}
        <div className="w-32 h-1 bg-white/20 rounded-full mx-auto mt-2"></div>
      </div>

      {/* Decorative reflection glare lines */}
      <div className="absolute top-0 right-10 bottom-0 w-2.5 bg-gradient-to-r from-white/0 via-white/5 to-white/0 transform skew-x-12 pointer-events-none group-hover:via-white/10 transition-all duration-700"></div>
    </div>
  );
};
