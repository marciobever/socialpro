"use client";
import React from 'react';

type DemoSlide = {
  tag: string;
  title: string;
  subtitle: string;
  bg: string;
  anim: string;
};

const SLIDES: DemoSlide[] = [
  {
    tag: 'GANCHO',
    title: 'PARE DE POSTAR NO VAZIO',
    subtitle: 'O algoritmo premia retenção, não frequência.',
    bg: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #c084fc 100%)',
    anim: 'slide-anim-minimalist',
  },
  {
    tag: '01',
    title: 'GANCHO DE FRICÇÃO',
    subtitle: 'As 2 primeiras linhas decidem 80% do alcance.',
    bg: 'radial-gradient(circle at top right, #8b5cf6 0%, #06b6d4 100%)',
    anim: 'slide-anim-tech',
  },
  {
    tag: '02',
    title: 'UM VALOR POR SLIDE',
    subtitle: 'Cada tela entrega uma ideia clara e única.',
    bg: 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #f43f5e 100%)',
    anim: 'slide-anim-alert',
  },
  {
    tag: 'CTA',
    title: 'SALVE ESTE POST',
    subtitle: 'Comente "EU QUERO" e receba o checklist.',
    bg: 'linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #f43f5e 100%)',
    anim: 'slide-anim-minimalist',
  },
];

const COUNT = SLIDES.length;

/** Shortest signed distance from the active index on a circular track. */
function circularOffset(i: number, active: number) {
  let offset = i - active;
  if (offset > COUNT / 2) offset -= COUNT;
  if (offset < -COUNT / 2) offset += COUNT;
  return offset;
}

/**
 * Self-rotating "coverflow" carousel that showcases the live animated
 * style models — active slide centered, neighbours peeking at the sides.
 */
export const AnimatedCarouselPreview: React.FC = () => {
  const [index, setIndex] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const autoRotateTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % COUNT), 3200);
    return () => clearInterval(timer);
  }, [paused]);

  const handleCardClick = (i: number) => {
    setIndex(i);
    // Pause auto-rotation briefly when user manually clicks to allow reading
    setPaused(true);
    if (autoRotateTimeoutRef.current) {
      clearTimeout(autoRotateTimeoutRef.current);
    }
    autoRotateTimeoutRef.current = setTimeout(() => {
      setPaused(false);
    }, 6000);
  };

  React.useEffect(() => {
    return () => {
      if (autoRotateTimeoutRef.current) {
        clearTimeout(autoRotateTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className="relative w-full h-full flex items-center justify-center overflow-hidden py-4"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Coverflow stage */}
      <div className="relative w-full h-[200px] flex items-center justify-center [perspective:1000px]">
        {SLIDES.map((slide, i) => {
          const offset = circularOffset(i, index);
          const isActive = offset === 0;
          const isHidden = Math.abs(offset) > 1;
          return (
            <div
              key={i}
              onClick={() => handleCardClick(i)}
              className={`absolute aspect-[4/5] h-[190px] rounded-2xl border border-white/10 shadow-[0_15px_35px_-5px_rgba(0,0,0,0.7)] text-left text-white overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer ${
                isActive 
                  ? 'ring-2 ring-accent-purple/30 shadow-[0_20px_40px_-10px_rgba(139,92,246,0.3)]' 
                  : 'hover:border-white/20'
              } ${slide.anim}`}
              style={{
                background: slide.bg,
                transform: `translateX(${offset * 125}px) scale(${isActive ? 1 : 0.8}) rotateY(${offset * -26}deg)`,
                opacity: isHidden ? 0 : isActive ? 1 : 0.5,
                zIndex: isActive ? 20 : 10 - Math.abs(offset),
                filter: isActive ? 'none' : 'saturate(0.75) contrast(0.95)',
                pointerEvents: isHidden ? 'none' : 'auto',
              }}
            >
              {/* Card top glare shine overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/[0.04] to-white/0 pointer-events-none"></div>

              <div className="flex flex-col justify-between h-full p-4 relative z-10">
                {/* Top row */}
                <div className="flex justify-between items-center">
                  <span className="text-[7px] font-black tracking-widest uppercase bg-black/40 backdrop-blur-md px-2 py-0.5 rounded border border-white/10">
                    SOLPRO.AI
                  </span>
                  <span className="text-[7px] font-bold bg-black/40 backdrop-blur-md px-2 py-0.5 rounded border border-white/10">
                    {i + 1}/{COUNT}
                  </span>
                </div>

                {/* Content (only re-animates on the active card) */}
                <div
                  key={isActive ? `a-${index}` : `s-${i}`}
                  className={`space-y-1.5 ${isActive ? 'animate-slide-swap' : ''}`}
                >
                  <span className="inline-block text-[7px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded leading-none">
                    {slide.tag}
                  </span>
                  <h4
                    className="font-display font-black text-[12px] uppercase leading-tight tracking-tight"
                    style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}
                  >
                    {slide.title}
                  </h4>
                  <p
                    className="text-[9px] text-white/90 leading-normal font-light"
                    style={{ textShadow: '0 1px 5px rgba(0,0,0,0.8)' }}
                  >
                    {slide.subtitle}
                  </p>
                </div>

                {/* Progress dots & author watermark */}
                <div className="flex items-center justify-between border-t border-white/10 pt-2">
                  <div className="flex gap-1">
                    {SLIDES.map((_, d) => (
                      <span
                        key={d}
                        className={`h-0.5 rounded-full transition-all duration-500 ${
                          d === i ? 'w-3 bg-white' : 'w-1 bg-white/40'
                        }`}
                      />
                    ))}
                  </div>
                  
                  {/* Subtle creator profile badge inside card */}
                  <div className="flex items-center gap-1 bg-black/20 px-1.5 py-0.5 rounded-full border border-white/5">
                    <div className="h-2.5 w-2.5 rounded-full bg-accent-purple flex items-center justify-center text-[4px] font-bold text-white">M</div>
                    <span className="text-[5.5px] text-white/80 font-medium tracking-wide">@marcelo</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Corner status badge */}
      <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-md border border-white/10 px-2 py-1 rounded-full shadow-lg z-30 select-none pointer-events-none">
        <span className="h-1.5 w-1.5 rounded-full bg-accent-cyan animate-pulse" />
        <span className="text-[7px] font-bold text-white tracking-wide">Preview do Editor</span>
      </div>
    </div>
  );
};
