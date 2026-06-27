"use client";
import React from 'react';
import { Heart, MessageCircle, Send, Bookmark } from 'lucide-react';

interface SlideRendererProps {
  title: string;
  subtitle: string;
  layoutTemplate?: 'default' | 'hook' | 'comparison' | 'mockup' | 'cta';
  index: number;
  total: number;
  brandHandle?: string;
  isThumbnail?: boolean;
}

export const SlideRenderer: React.FC<SlideRendererProps> = ({
  title,
  subtitle,
  layoutTemplate = 'default',
  index,
  total,
  brandHandle,
  isThumbnail = false,
}) => {
  const handleText = brandHandle || '@handle';

  // Base font size scaling
  const titleSize = isThumbnail
    ? layoutTemplate === 'hook' ? 'text-[10px]' : 'text-[8.5px]'
    : layoutTemplate === 'hook' ? 'text-[22px] md:text-[24px]' : 'text-[16px] md:text-[18px]';

  const subtitleSize = isThumbnail ? 'text-[6.5px]' : 'text-[11px] md:text-[12px]';

  // Render header
  const renderHeader = () => (
    <div className="flex justify-between items-center w-full select-none z-10">
      <span className={`font-black tracking-widest uppercase bg-black/35 backdrop-blur-sm rounded border border-white/5 ${isThumbnail ? 'text-[5px] px-1 py-0.5' : 'text-[8.5px] px-1.5 py-0.5'}`}>
        SOLPRO.AI
      </span>
      <span className={`font-bold bg-black/35 backdrop-blur-sm rounded border border-white/5 ${isThumbnail ? 'text-[5px] px-1 py-0.5' : 'text-[8.5px] px-1.5 py-0.5'}`}>
        {index + 1} / {total}
      </span>
    </div>
  );

  // Render templates
  switch (layoutTemplate) {
    case 'hook': // Gancho Forte
      return (
        <div className="h-full w-full flex flex-col justify-between p-3 relative text-left">
          {renderHeader()}
          <div className="flex-1 flex flex-col justify-center items-center text-center px-1 my-auto z-10">
            <span className={`font-black uppercase tracking-widest bg-accent-purple/20 text-accent-cyan border border-accent-purple/30 rounded px-1.5 py-0.5 mb-2 w-fit leading-none ${isThumbnail ? 'text-[4.5px]' : 'text-[9px]'}`}>
              {index === 0 ? 'GANCHO' : 'ATENÇÃO'}
            </span>
            <h4
              className={`font-display font-black uppercase leading-tight tracking-tight text-white ${titleSize}`}
              style={{ textShadow: '0 2px 10px rgba(0,0,0,0.6)' }}
            >
              {title || 'Título de Destaque'}
            </h4>
            {subtitle && (
              <p className={`text-white/80 font-light mt-2 ${subtitleSize}`} style={{ textShadow: '0 1px 5px rgba(0,0,0,0.5)' }}>
                {subtitle}
              </p>
            )}
          </div>
          {/* Subtle swipe indicator */}
          <div className="flex justify-between items-center z-10 border-t border-white/5 pt-1 mt-1">
            <div className="flex gap-0.5">
              {[...Array(total)].map((_, d) => (
                <span key={d} className={`h-0.5 rounded-full ${isThumbnail ? (d === index ? 'w-2 bg-white' : 'w-0.5 bg-white/30') : (d === index ? 'w-3.5 bg-white' : 'w-1 bg-white/30')}`} />
              ))}
            </div>
            <span className={`tracking-wider font-semibold opacity-60 uppercase ${isThumbnail ? 'text-[4.5px]' : 'text-[7.5px]'}`}>
              Deslize &gt;&gt;
            </span>
          </div>
        </div>
      );

    case 'comparison': // Comparativo
      const parts = subtitle.split('|').map((p) => p.trim());
      const hasTwoColumns = parts.length >= 2;
      return (
        <div className="h-full w-full flex flex-col justify-between p-3 relative text-left">
          {renderHeader()}
          <div className="flex-1 flex flex-col justify-center py-1 z-10">
            <h4
              className={`font-display font-bold uppercase leading-tight tracking-tight text-white mb-2 ${isThumbnail ? 'text-[8px]' : 'text-[14px]'}`}
              style={{ textShadow: '0 2px 6px rgba(0,0,0,0.5)' }}
            >
              {title || 'Título Comparativo'}
            </h4>
            {hasTwoColumns ? (
              <div className="grid grid-cols-2 gap-1.5 mt-0.5">
                <div className="bg-black/35 border border-white/5 rounded-xl p-1.5 flex flex-col justify-between">
                  <span className={`font-black text-accent-purple tracking-wider uppercase block border-b border-white/5 pb-0.5 mb-1 ${isThumbnail ? 'text-[4.5px]' : 'text-[8px]'}`}>
                    Opção A
                  </span>
                  <p className={`text-white/90 leading-snug font-medium ${isThumbnail ? 'text-[5.5px]' : 'text-[10px]'}`}>
                    {parts[0]}
                  </p>
                </div>
                <div className="bg-black/35 border border-white/5 rounded-xl p-1.5 flex flex-col justify-between">
                  <span className={`font-black text-accent-cyan tracking-wider uppercase block border-b border-white/5 pb-0.5 mb-1 ${isThumbnail ? 'text-[4.5px]' : 'text-[8px]'}`}>
                    Opção B
                  </span>
                  <p className={`text-white/90 leading-snug font-medium ${isThumbnail ? 'text-[5.5px]' : 'text-[10px]'}`}>
                    {parts[1]}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-black/25 border border-white/5 rounded-xl p-2">
                <p className={`text-white/90 leading-relaxed font-light ${subtitleSize}`}>
                  {subtitle || 'Use | no subtítulo para separar duas colunas.'}
                </p>
              </div>
            )}
          </div>
          <div className="flex gap-0.5 z-10">
            {[...Array(total)].map((_, d) => (
              <span key={d} className={`h-0.5 rounded-full ${isThumbnail ? (d === index ? 'w-2 bg-white' : 'w-0.5 bg-white/30') : (d === index ? 'w-3.5 bg-white' : 'w-1 bg-white/30')}`} />
            ))}
          </div>
        </div>
      );

    case 'mockup': // Mockup Embutido
      return (
        <div className="h-full w-full flex flex-col justify-between p-3 relative text-left">
          {renderHeader()}
          <div className="flex-1 flex flex-col justify-center py-1 z-10">
            {/* Simulated window header */}
            <div className="bg-black/45 border border-white/10 rounded-t-xl px-2 py-1 flex items-center gap-1.5 shadow-md">
              <div className="flex gap-1 flex-shrink-0">
                {['#ff5f57', '#ffbd2e', '#28c840'].map((c, i) => (
                  <div key={i} className={`rounded-full ${isThumbnail ? 'h-0.5 w-0.5' : 'h-1.5 w-1.5'}`} style={{ backgroundColor: c }} />
                ))}
              </div>
              <div className="flex-1 bg-white/5 rounded px-1.5 text-center text-white/20 select-none overflow-hidden truncate font-mono" style={{ fontSize: isThumbnail ? '3.5px' : '7.5px' }}>
                {handleText.replace('@', '')}.app
              </div>
            </div>
            {/* Simulated window body */}
            <div className="bg-[#0f1117] border-x border-b border-white/10 rounded-b-xl p-2 flex flex-col gap-1.5 shadow-inner">
              <h5 className={`font-display font-black text-white leading-tight ${isThumbnail ? 'text-[7.5px]' : 'text-[12.5px]'}`}>
                {title || 'Título do Mockup'}
              </h5>
              <p className={`text-white/70 leading-normal font-light ${isThumbnail ? 'text-[5.5px]' : 'text-[9.5px]'}`}>
                {subtitle || 'Visualização tipo app.'}
              </p>
            </div>
          </div>
          <div className="flex gap-0.5 z-10">
            {[...Array(total)].map((_, d) => (
              <span key={d} className={`h-0.5 rounded-full ${isThumbnail ? (d === index ? 'w-2 bg-white' : 'w-0.5 bg-white/30') : (d === index ? 'w-3.5 bg-white' : 'w-1 bg-white/30')}`} />
            ))}
          </div>
        </div>
      );

    case 'cta': // CTA Final
      return (
        <div className="h-full w-full flex flex-col justify-between p-3 relative text-left">
          {renderHeader()}
          <div className="flex-1 flex flex-col justify-center items-center text-center px-2 my-auto z-10">
            <h4
              className={`font-display font-black uppercase leading-tight tracking-tight text-white mb-1.5 ${titleSize}`}
              style={{ textShadow: '0 2px 10px rgba(0,0,0,0.6)' }}
            >
              {title || 'Salve este post'}
            </h4>
            <p className={`text-white/85 leading-relaxed font-medium ${subtitleSize}`}>
              {subtitle || 'Gostou? Salve para ver depois.'}
            </p>

            {/* Social action icons */}
            <div className={`flex justify-center items-center bg-black/45 border border-white/5 rounded-full px-3 py-1 shadow-lg mt-2.5 ${isThumbnail ? 'gap-2.5' : 'gap-4.5'}`}>
              <Heart className={`text-rose-500 fill-rose-500/20 ${isThumbnail ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5'}`} />
              <MessageCircle className={`text-sky-400 fill-sky-400/10 ${isThumbnail ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5'}`} />
              <Send className={`text-emerald-400 ${isThumbnail ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5'}`} />
              <Bookmark className={`text-amber-400 fill-amber-400/20 ${isThumbnail ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5'}`} />
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-white/10 pt-1.5 z-10">
            <div className="flex gap-0.5">
              {[...Array(total)].map((_, d) => (
                <span key={d} className={`h-0.5 rounded-full ${isThumbnail ? (d === index ? 'w-2 bg-white' : 'w-0.5 bg-white/30') : (d === index ? 'w-3.5 bg-white' : 'w-1 bg-white/30')}`} />
              ))}
            </div>
            
            {/* Creator watermark tag */}
            <div className={`flex items-center gap-1 bg-black/35 px-1 py-0.5 rounded-full border border-white/5 ${isThumbnail ? 'scale-75 origin-right' : ''}`}>
              <div className="h-2.5 w-2.5 rounded-full bg-accent-purple flex items-center justify-center text-[4px] font-bold text-white">M</div>
              <span className="text-[5.5px] text-white/80 font-medium tracking-wide">{handleText}</span>
            </div>
          </div>
        </div>
      );

    default: // Default template
      return (
        <div className="h-full w-full flex flex-col justify-between p-3 relative text-left">
          {renderHeader()}
          <div className="space-y-1.5 py-2.5 z-10 my-auto text-left">
            <h4
              className={`font-display font-black uppercase leading-tight tracking-tight ${titleSize}`}
              style={{ textShadow: '0 2px 10px rgba(0,0,0,0.6)' }}
            >
              {title || 'Título Principal'}
            </h4>
            <p
              className={`text-white/90 leading-relaxed font-light ${subtitleSize}`}
              style={{ textShadow: '0 1px 5px rgba(0,0,0,0.6)' }}
            >
              {subtitle || 'Insira as informações de valor neste slide.'}
            </p>
          </div>
          <div className="flex items-center justify-between border-t border-white/10 pt-1.5 z-10">
            <div className="flex gap-0.5">
              {[...Array(total)].map((_, d) => (
                <span key={d} className={`h-0.5 rounded-full ${isThumbnail ? (d === index ? 'w-2 bg-white' : 'w-0.5 bg-white/30') : (d === index ? 'w-3.5 bg-white' : 'w-1 bg-white/30')}`} />
              ))}
            </div>
            <span className={`tracking-wider font-semibold opacity-70 ${isThumbnail ? 'text-[4.5px]' : 'text-[6.5px]'}`}>
              Deslize
            </span>
          </div>
        </div>
      );
  }
};
