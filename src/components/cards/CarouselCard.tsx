import React from 'react';
import type { Slide, CarouselStyleModel, WatermarkType, ToneType } from '../../types';
import { Loader2, Wand2, LayoutTemplate, Cpu, ImagePlus, X } from 'lucide-react';

interface CarouselCardProps {
  slides: Slide[];
  carouselTopic: string;
  onUpdateCarouselTopic: (topic: string) => void;
  carouselSlideCount: number;
  onUpdateCarouselSlideCount: (count: number) => void;
  isGeneratingCarousel: boolean;
  lastCarouselSource: 'ai' | 'fallback' | null;
  onGenerateCarousel: () => void;
  styleModel: CarouselStyleModel;
  onUpdateStyleModel: (model: CarouselStyleModel) => void;
  watermarkType: WatermarkType;
  onUpdateWatermarkType: (type: WatermarkType) => void;
  tone: ToneType;
  onUpdateTone: (tone: ToneType) => void;
  referenceImage: string | null;
  onUpdateReferenceImage: (img: string | null) => void;
  // unused but kept for compat
  activeSlideIndex: number;
  onUpdateSlides: (slides: Slide[]) => void;
  onSetActiveSlide: (index: number) => void;
  brandName: string;
  brandHandle: string;
  avatarUrl: string;
  onRegenerateSlideImage: (slideId: string, title: string, subtitle: string, imagePrompt: string) => void;
}

const TONES: { id: ToneType; label: string; emoji: string }[] = [
  { id: 'provocativo', label: 'Provocativo', emoji: '🌶️' },
  { id: 'autoridade',  label: 'Autoridade',  emoji: '👔'  },
  { id: 'storyteller', label: 'Storyteller', emoji: '📖' },
  { id: 'meme',        label: 'Meme',        emoji: '⚡'  },
];

const STYLE_GROUPS: { label: string; items: { id: CarouselStyleModel; name: string; swatch: string }[] }[] = [
  {
    label: 'Foto',
    items: [
      { id: 'lifestyle',  name: 'Lifestyle', swatch: 'linear-gradient(135deg,#d97706,#1c1713)' },
      { id: 'tech',       name: 'Cyber',     swatch: 'linear-gradient(135deg,#8b5cf6,#06b6d4)' },
      { id: 'alert',      name: 'Alerta',    swatch: 'linear-gradient(135deg,#7f1d1d,#f59e0b)' },
      { id: 'minimalist', name: 'Minimal',   swatch: 'linear-gradient(135deg,#0b0c10,#374151)' },
      { id: 'feminino',   name: 'Feminino',  swatch: 'linear-gradient(135deg,#f43f5e,#ec4899,#f9a8d4)' },
      { id: 'neutro',     name: 'Neutro',    swatch: 'linear-gradient(135deg,#d4b896,#f5f0e8,#c9a87a)' },
      { id: 'retro',      name: 'Retrô',     swatch: 'linear-gradient(135deg,#92400e,#b45309,#fbbf24)' },
    ],
  },
  {
    label: 'Avatar',
    items: [
      { id: 'pixar',    name: '3D Pixar',  swatch: 'linear-gradient(135deg,#60a5fa,#a78bfa,#f472b6)' },
      { id: 'anime',    name: 'Anime',     swatch: 'linear-gradient(135deg,#f472b6,#fb923c,#facc15)' },
      { id: 'aquarela', name: 'Aquarela',  swatch: 'linear-gradient(135deg,#7dd3fc,#86efac,#fde68a)' },
      { id: 'flat',     name: 'Flat Art',  swatch: 'linear-gradient(135deg,#10b981,#3b82f6,#8b5cf6)' },
      { id: 'cartoon',  name: 'Cartoon',   swatch: 'linear-gradient(135deg,#ef4444,#f97316,#facc15)' },
      { id: 'infantil', name: 'Infantil',  swatch: 'linear-gradient(135deg,#fb923c,#facc15,#4ade80)' },
    ],
  },
];

// Flat list for cycling (chip click)
const STYLE_MODELS: { id: CarouselStyleModel; name: string; swatch: string }[] =
  STYLE_GROUPS.flatMap(g => g.items);

const SLIDE_COUNTS = [3, 4, 5, 6, 7, 8];
const WATERMARK_LABELS: Record<WatermarkType, string> = { both: 'Nome + @', handle: 'Só @', none: 'Sem marca' };

export const CarouselCard: React.FC<CarouselCardProps> = ({
  slides,
  carouselTopic, onUpdateCarouselTopic,
  carouselSlideCount, onUpdateCarouselSlideCount,
  isGeneratingCarousel, lastCarouselSource, onGenerateCarousel,
  styleModel, onUpdateStyleModel,
  watermarkType, onUpdateWatermarkType,
  tone, onUpdateTone,
  referenceImage, onUpdateReferenceImage,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onUpdateReferenceImage(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = ''; // reset so same file can be re-selected
  };
  const imagesReady   = slides.filter(s => s.imageUrl).length;
  const isAnyGenerating = slides.some(s => s.isGeneratingImage);
  const canGenerate   = !isGeneratingCarousel && carouselTopic.trim().length > 0;

  const currentTone  = TONES.find(t => t.id === tone) ?? TONES[0];

  const cycleTone      = () => { const i = TONES.findIndex(t => t.id === tone); onUpdateTone(TONES[(i + 1) % TONES.length].id); };
  const cycleSlides    = () => { const i = SLIDE_COUNTS.indexOf(carouselSlideCount); onUpdateCarouselSlideCount(SLIDE_COUNTS[(i + 1) % SLIDE_COUNTS.length]); };
  const cycleWatermark = () => { const types: WatermarkType[] = ['both', 'handle', 'none']; const i = types.indexOf(watermarkType); onUpdateWatermarkType(types[(i + 1) % types.length]); };

  return (
    <div className="glass-panel rounded-2xl overflow-hidden border border-dark-border focus-within:border-accent-purple/40 transition-colors w-full">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-dark-border bg-dark-border/20 select-none">
        <div className="flex items-center gap-2">
          <Cpu className="h-3.5 w-3.5 text-accent-purple" />
          <span className="text-[10px] font-bold text-dark-muted uppercase tracking-wider">gpt-image-2</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        </div>
        <div className="flex items-center gap-3 text-[9px]">
          {isAnyGenerating && <span className="text-accent-cyan animate-pulse font-semibold">Gerando imagens...</span>}
          {!isAnyGenerating && imagesReady > 0 && <span className="text-emerald-400 font-semibold">✓ {imagesReady}/{slides.length} prontos</span>}
          {lastCarouselSource && !isGeneratingCarousel && !isAnyGenerating && (
            <span className={lastCarouselSource === 'ai' ? 'text-accent-cyan font-semibold' : 'text-amber-400 font-semibold'}>
              {lastCarouselSource === 'ai' ? '✨ IA + pesquisa' : '⚡ offline'}
            </span>
          )}
        </div>
      </div>

      <div className="px-5 pt-4 pb-4 space-y-3">
        {/* Textarea */}
        <textarea
          value={carouselTopic}
          onChange={e => onUpdateCarouselTopic(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && canGenerate) { e.preventDefault(); onGenerateCarousel(); } }}
          disabled={isGeneratingCarousel}
          rows={4}
          className="w-full bg-transparent border-none outline-none resize-none text-dark-text placeholder:text-dark-muted/40 font-medium text-sm leading-relaxed disabled:opacity-60"
          placeholder="Descreva o tema do carrossel... Ex: 5 erros que destroem sua taxa de conversão"
        />

        {/* Reference image upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleFileChange}
          disabled={isGeneratingCarousel}
        />

        {referenceImage ? (
          <div className="flex items-center gap-3 p-2 rounded-xl bg-dark-border/30 border border-accent-purple/30 animate-fade-in">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={referenceImage}
              alt="Referência"
              className="h-12 w-12 rounded-lg object-cover border border-dark-border flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-accent-cyan">Imagem de referência ativa</p>
              <p className="text-[10px] text-dark-muted">gpt-image-2 usará este visual em todos os slides</p>
            </div>
            <button
              type="button"
              onClick={() => onUpdateReferenceImage(null)}
              disabled={isGeneratingCarousel}
              className="p-1 rounded-lg hover:bg-dark-border text-dark-muted hover:text-dark-text transition-all disabled:opacity-50 flex-shrink-0"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isGeneratingCarousel}
            className="flex items-center gap-2 text-[11px] font-medium text-dark-muted hover:text-accent-cyan border border-dashed border-dark-border hover:border-accent-purple/40 rounded-xl px-3 py-2 transition-all disabled:opacity-50 w-fit"
          >
            <ImagePlus className="h-3.5 w-3.5" />
            Adicionar imagem de referência <span className="text-dark-muted/50">(opcional)</span>
          </button>
        )}

        {/* Progress bar — only when visible */}
        {(isAnyGenerating || imagesReady > 0) && (
          <div className="h-0.5 bg-dark-border rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-accent-purple to-accent-cyan rounded-full transition-all duration-500"
              style={{ width: `${(imagesReady / slides.length) * 100}%` }}
            />
          </div>
        )}

        {/* Chips + Generate */}
        <div className="flex items-center gap-2 flex-wrap border-t border-dark-border pt-3">

          {/* Tom */}
          <button type="button" onClick={cycleTone} disabled={isGeneratingCarousel}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-dark-border/40 border border-dark-border text-[11px] font-semibold text-dark-muted hover:text-dark-text hover:border-accent-purple/50 hover:bg-accent-purple/5 active:scale-95 transition-all duration-150 disabled:opacity-50 select-none">
            {currentTone.emoji} {currentTone.label}
          </button>


          {/* Nº slides */}
          <button type="button" onClick={cycleSlides} disabled={isGeneratingCarousel}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-dark-border/40 border border-dark-border text-[11px] font-semibold text-dark-muted hover:text-dark-text hover:border-accent-purple/50 hover:bg-accent-purple/5 active:scale-95 transition-all duration-150 disabled:opacity-50 select-none">
            <LayoutTemplate className="h-3.5 w-3.5" />
            {carouselSlideCount} slides
          </button>

          {/* Marca d'água */}
          <button type="button" onClick={cycleWatermark} disabled={isGeneratingCarousel}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-dark-border/40 border border-dark-border text-[11px] font-semibold text-dark-muted hover:text-dark-text hover:border-accent-purple/50 hover:bg-accent-purple/5 active:scale-95 transition-all duration-150 disabled:opacity-50 select-none">
            {WATERMARK_LABELS[watermarkType]}
          </button>

          {/* Gerar */}
          <button onClick={onGenerateCarousel} disabled={!canGenerate}
            className={`ml-auto flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold text-white bg-gradient-to-r from-accent-purple to-accent-cyan transition-all duration-300 disabled:opacity-50 disabled:shadow-none whitespace-nowrap ${
              isGeneratingCarousel
                ? 'shadow-[0_0_24px_rgba(139,92,246,0.55)] scale-[0.98]'
                : 'shadow-[0_0_14px_rgba(139,92,246,0.3)] hover:shadow-[0_0_28px_rgba(139,92,246,0.55)] hover:scale-[1.02] active:scale-95'
            }`}>
            {isGeneratingCarousel
              ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Gerando...</>
              : <><Wand2 className="h-3.5 w-3.5" />Gerar carrossel</>}
          </button>
        </div>
      </div>
    </div>
  );
};
