"use client";
import React from 'react';
import { useAppContext } from '@/context/AppContext';
import { ChevronLeft, ChevronRight, ImageIcon, Loader2 } from 'lucide-react';
import { SlideRenderer } from './SlideRenderer';

interface PanelHeaderProps {
  label: string;
  children?: React.ReactNode;
}

const PanelHeader = React.memo(function PanelHeader({
  label, children,
}: PanelHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] flex-shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-[11px] font-bold text-white/55 uppercase tracking-[0.14em] truncate">{label}</span>
      </div>
      {children && <div className="flex items-center gap-2 flex-shrink-0">{children}</div>}
    </div>
  );
});

export function PreviewPanel() {
  const {
    platform,
    slides,
    activeSlideIndex,
    setActiveSlideIndex,
    content,
    brandKit,
  } = useAppContext();

  const isCarousel = platform === 'instagram';

  return (
    <div className="flex-1 flex flex-col rounded-3xl border border-dark-border bg-dark-panel overflow-hidden min-h-0 max-lg:min-h-[420px]">
      <PanelHeader label={`Preview — ${platform === 'instagram' ? 'Instagram' : platform === 'x' ? 'X / Twitter' : 'LinkedIn'}`}>
        <span className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-400 uppercase tracking-wide">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />ao vivo
        </span>
      </PanelHeader>
      <div className="flex-1 overflow-y-auto p-3 flex items-start justify-center" style={{ scrollbarWidth: 'thin' }}>
        {/* Mock post card */}
        <div className="w-full rounded-2xl border border-dark-border bg-[#13151d] [data-theme=light]:bg-white overflow-hidden shadow-sm">
          {/* Profile header */}
          <div className="flex items-center gap-2.5 px-3 py-2.5 border-b border-white/[0.05]">
            {brandKit.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={brandKit.avatarUrl} alt="" className="h-7 w-7 rounded-full object-cover flex-shrink-0 border border-white/[0.1]" />
            ) : (
              <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-accent-purple to-accent-cyan flex items-center justify-center flex-shrink-0">
                <span className="text-[8px] font-bold text-white">{(brandKit.brandName || 'SP').slice(0,2).toUpperCase()}</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-white/80 truncate">{brandKit.brandName || 'Seu Nome'}</p>
              <p className="text-[9px] text-white/35">{brandKit.brandHandle || '@handle'}</p>
            </div>
            <div className="text-white/20">···</div>
          </div>

          {/* Image area — Instagram only */}
          {isCarousel && (() => {
            const previewSlide = slides[activeSlideIndex] ?? slides[0];
            return (
              <div className="aspect-square w-full relative overflow-hidden group/prev">
                {previewSlide?.isGeneratingImage && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-black/55 backdrop-blur-[2px]">
                    <Loader2 className="h-6 w-6 text-accent-purple animate-spin" />
                    <span className="text-[10px] font-semibold text-white/70">Gerando imagem…</span>
                  </div>
                )}
                {previewSlide?.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previewSlide.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : previewSlide?.background ? (
                  <div className="w-full h-full" style={{ background: previewSlide.background }}>
                    <SlideRenderer
                      title={previewSlide.title}
                      subtitle={previewSlide.subtitle}
                      layoutTemplate={previewSlide.layoutTemplate}
                      index={activeSlideIndex}
                      total={slides.length}
                      brandHandle={brandKit.brandHandle}
                      isThumbnail={false}
                    />
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2" style={{ background: '#14161e' }}>
                    <ImageIcon className="h-6 w-6 text-white/15" />
                    <span className="text-[11px] text-white/25">Gere o carrossel para o preview</span>
                  </div>
                )}

                {slides.length > 1 && (
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-sm">
                    <span className="text-[8px] text-white font-bold tabular-nums">{activeSlideIndex + 1}/{slides.length}</span>
                  </div>
                )}

                {slides.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveSlideIndex(Math.max(activeSlideIndex - 1, 0))}
                      disabled={activeSlideIndex === 0}
                      className="absolute left-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-black/55 backdrop-blur-sm border border-white/15 text-white flex items-center justify-center opacity-0 group-hover/prev:opacity-100 disabled:opacity-0 transition-opacity cursor-pointer"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setActiveSlideIndex(Math.min(activeSlideIndex + 1, slides.length - 1))}
                      disabled={activeSlideIndex >= slides.length - 1}
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-black/55 backdrop-blur-sm border border-white/15 text-white flex items-center justify-center opacity-0 group-hover/prev:opacity-100 disabled:opacity-0 transition-opacity cursor-pointer"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </>
                )}

                {slides.length > 1 && (
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1">
                    {slides.map((s, i) => (
                      <button key={s.id} onClick={() => setActiveSlideIndex(i)}
                        className={`h-1.5 rounded-full transition-all ${i === activeSlideIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70'}`} />
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Engagement row */}
          {platform === 'instagram' ? (
            <div className="px-3 py-2 space-y-1.5">
              <div className="flex items-center gap-3 text-white/40">
                <span className="text-[14px]">♥</span>
                <span className="text-[14px]">💬</span>
                <span className="text-[14px]">➤</span>
                <span className="ml-auto text-[14px]">⊡</span>
              </div>
              <p className="text-[10px] font-bold text-white/60">127 curtidas</p>
              <p className="text-[10px] text-white/50 line-clamp-2 leading-relaxed">
                <span className="font-bold text-white/70">{brandKit.brandHandle || '@handle'}</span>{' '}
                {content || 'A legenda aparecerá aqui após gerar...'}
              </p>
              {content && <p className="text-[10px] text-white/30">mais</p>}
            </div>
          ) : platform === 'x' ? (
            <div className="px-3 py-2 space-y-1.5">
              <p className="text-[10px] text-white/55 line-clamp-3 leading-relaxed">
                {content || 'Texto do tweet aparecerá aqui...'}
              </p>
              <div className="flex items-center gap-4 text-white/30 pt-1">
                <span className="text-[11px]">💬 12</span>
                <span className="text-[11px]">↻ 34</span>
                <span className="text-[11px]">♥ 218</span>
              </div>
            </div>
          ) : (
            <div className="px-3 py-2 space-y-1.5">
              <p className="text-[10px] text-white/55 line-clamp-3 leading-relaxed">
                {content || 'Texto do post LinkedIn aparecerá aqui...'}
              </p>
              <div className="flex items-center gap-3 pt-1 border-t border-white/[0.05]">
                <span className="text-[11px]">👍 ❤️</span>
                <span className="text-[10px] text-white/30">43 reações · 8 comentários</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
