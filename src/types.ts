export type PlatformType = 'linkedin' | 'x' | 'instagram';

export type ToneType = 'provocativo' | 'autoridade' | 'storyteller' | 'meme';
export type CarouselStyleModel =
  | 'lifestyle' | 'tech' | 'alert' | 'minimalist'
  | 'infantil' | 'feminino' | 'neutro' | 'retro'
  | 'pixar' | 'anime' | 'aquarela' | 'flat' | 'cartoon' | 'neon';

export type WatermarkType = 'both' | 'handle' | 'none';

export interface Slide {
  id: string;
  title: string;
  subtitle: string;
  background: string;
  imageUrl?: string;
  imagePrompt?: string;
  isGeneratingImage?: boolean;
  imageError?: string;
  layoutTemplate?: 'default' | 'hook' | 'comparison' | 'mockup' | 'cta';
}

export interface SocialPostState {
  platform: PlatformType;
  tone: ToneType;
  content: string;
  slides: Slide[];
  activeSlideIndex: number;
}

export interface EditorialItem {
  id: string;
  day: string; // e.g. "Seg", "Ter"
  dayNumber: number;
  platform: PlatformType;
  time: string;
  title: string;
  status: 'published' | 'scheduled' | 'draft';
}
