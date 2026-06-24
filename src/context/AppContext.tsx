"use client";
import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import type { PlatformType, ToneType, Slide, EditorialItem, CarouselStyleModel, WatermarkType } from '../types';

interface SubscriptionState {
  status: string;
  plan_id: string;
  carousel_limit: number;
  carousels_used: number;
  period_end: string | null;
}

interface AppContextType {
  subscription: SubscriptionState | null;
  loadSubscription: () => Promise<void>;
  profileLoaded: boolean;
  brandKit: {
    brandName: string;
    brandHandle: string;
    avatarUrl: string;
    aiBio: string;
  };
  setBrandKit: React.Dispatch<React.SetStateAction<{
    brandName: string;
    brandHandle: string;
    avatarUrl: string;
    aiBio: string;
  }>>;
  planName: string;
  setPlanName: (plan: string) => void;
  styleModel: CarouselStyleModel;
  setStyleModel: (model: CarouselStyleModel) => void;
  watermarkType: WatermarkType;
  setWatermarkType: (type: WatermarkType) => void;
  platform: PlatformType;
  setPlatform: (platform: PlatformType) => void;
  tone: ToneType;
  setTone: (tone: ToneType) => void;
  content: string;
  setContent: (content: string) => void;
  slides: Slide[];
  setSlides: React.Dispatch<React.SetStateAction<Slide[]>>;
  activeSlideIndex: number;
  setActiveSlideIndex: (index: number) => void;
  isGenerating: boolean;
  setIsGenerating: (gen: boolean) => void;
  carouselTopic: string;
  setCarouselTopic: (topic: string) => void;
  carouselSlideCount: number;
  setCarouselSlideCount: (count: number) => void;
  referenceImage: string | null;
  setReferenceImage: (img: string | null) => void;
  isGeneratingCarousel: boolean;
  lastCarouselSource: 'ai' | 'fallback' | null;
  scheduledItems: EditorialItem[];
  setScheduledItems: React.Dispatch<React.SetStateAction<EditorialItem[]>>;
  selectedItemId: string;
  setSelectedItemId: (id: string) => void;
  handleLoginSuccess: (selectedPlan: string) => void;
  handleAddScheduledItem: (newItem: EditorialItem) => void;
  handleDeleteScheduledItem: (id: string) => void;
  handleAIGenerate: () => Promise<void>;
  handleGenerateCarousel: () => Promise<void>;
  handleRegenerateSlideImage: (slideId: string, title: string, subtitle: string, imagePrompt: string) => Promise<void>;
  handleRegenerateAllImages: () => Promise<void>;
  handleRefineCaption: () => Promise<void>;
  handleGenerateTextPost: () => Promise<void>;
  handleSelectItem: (item: EditorialItem) => void;
  handleSelectIdea: (hook: string, structure: string) => void;
  upgradeModalOpen: boolean;
  setUpgradeModalOpen: (open: boolean) => void;
  upgradeReason: 'subscription_required' | 'usage_limit_reached' | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_SLIDES: Slide[] = [
  {
    id: 's1',
    title: 'Login por GitHub foi alterado',
    subtitle: '🚨 A ajuda oficial informa que GitHub e Facebook não são mais opções de login. O acesso migrou para e-mail ou Google.',
    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #c084fc 100%)',
  },
  {
    id: 's2',
    title: '01. O Gancho de Fricção',
    subtitle: 'Prenda a atenção forçando o cérebro do usuário a parar o scroll. Notícias urgentes geram mais cliques.',
    background: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 50%, #22d3ee 100%)',
  },
  {
    id: 's3',
    title: '02. Explique a Solução',
    subtitle: 'Ninguém quer suspense bobo. Mostre o passo a passo da migração com capturas de tela simplificadas.',
    background: 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #f43f5e 100%)',
  },
  {
    id: 's4',
    title: '03. CTA com Resumo',
    subtitle: 'Não termine sem orientações claras de segurança. Deixe suas redes sociais visíveis no rodapé do slide.',
    background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #f43f5e 100%)',
  },
];

const INITIAL_CALENDAR_ITEMS: EditorialItem[] = [
  { id: 'c1', day: 'Seg', dayNumber: 8, platform: 'linkedin', time: '09:00', title: 'Framework de Escala', status: 'published' },
  { id: 'c2', day: 'Ter', dayNumber: 9, platform: 'x', time: '14:30', title: 'O Mito do Trabalho Duro', status: 'published' },
  { id: 'c3', day: 'Qua', dayNumber: 10, platform: 'linkedin', time: '10:15', title: 'Como Criar Conteúdo Magnético', status: 'scheduled' },
  { id: 'c4', day: 'Qua', dayNumber: 10, platform: 'instagram', time: '18:00', title: 'Carrossel: Mudança de Login GitHub', status: 'scheduled' },
  { id: 'c5', day: 'Sex', dayNumber: 12, platform: 'instagram', time: '12:00', title: 'Design Figma System', status: 'draft' },
];

const defaultBrandKit = {
  brandName:   '',
  brandHandle: '',
  avatarUrl:   '',
  aiBio:       '',
};

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [brandKit, setBrandKitState] = useState(defaultBrandKit);
  const [profileLoaded, setProfileLoaded] = useState(false);

  // Load profile from DB on mount
  React.useEffect(() => {
    fetch('/api/profile')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setBrandKitState(data); })
      .catch(() => { /* silent — keep defaults */ })
      .finally(() => setProfileLoaded(true));
  }, []);

  const setBrandKit = setBrandKitState;

  const [subscription, setSubscription] = useState<SubscriptionState | null>(null);

  const loadSubscription = async () => {
    try {
      const res = await fetch('/api/subscription');
      if (res.ok) {
        const { subscription: sub } = await res.json();
        setSubscription(sub);
      }
    } catch { /* silent */ }
  };

  React.useEffect(() => { loadSubscription(); }, []);

  const [planName, setPlanName] = useState<string>('Starter Creator');
  const [styleModel, setStyleModel] = useState<CarouselStyleModel>('lifestyle');
  const [watermarkType, setWatermarkType] = useState<WatermarkType>('both');
  const [platform, setPlatform] = useState<PlatformType>('instagram');
  const [tone, setTone] = useState<ToneType>('provocativo');

  const [content, setContent] = useState<string>(
    `🚨 ATENÇÃO STRIPE E GITHUB: Login alterado!\n\nA ajuda oficial informa que o botão de autenticação automática pelo GitHub e Facebook foi desativado por questões de segurança. O acesso agora migrou para e-mail ou Google.\n\nVeja as instruções completas nos slides ao lado ➡️`
  );

  const [slides, setSlides] = useState<Slide[]>(INITIAL_SLIDES);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [carouselTopic, setCarouselTopic] = useState<string>('');
  const [carouselSlideCount, setCarouselSlideCount] = useState<number>(5);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [isGeneratingCarousel, setIsGeneratingCarousel] = useState<boolean>(false);
  const [lastCarouselSource, setLastCarouselSource] = useState<'ai' | 'fallback' | null>(null);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState<boolean>(false);
  const [upgradeReason, setUpgradeReason] = useState<'subscription_required' | 'usage_limit_reached' | null>(null);
  const currentCarouselIdRef = useRef<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [scheduledItems, setScheduledItems] = useState<EditorialItem[]>(INITIAL_CALENDAR_ITEMS);
  const [selectedItemId, setSelectedItemId] = useState<string>('c4');

  const STYLE_PROMPTS: Record<CarouselStyleModel, string> = {
    // ── Fotografia realista ──
    lifestyle:  'warm lifestyle photography aesthetic, golden hour lighting, cozy organic atmosphere, amber and warm tones, soft bokeh, editorial magazine feel, rich textures',
    tech:       'cyberpunk aesthetic, neon purple and cyan glow effects, dark futuristic digital environment, holographic elements, sci-fi atmosphere, deep blacks with electric accents',
    alert:      'urgent breaking news style, dramatic red and yellow high-contrast lighting, bold powerful composition, warning atmosphere, photojournalism editorial energy',
    minimalist: 'ultra-clean minimal design, predominantly black and white, elegant negative space, modern editorial aesthetic, subtle geometric accents, luxury magazine style',
    feminino:   'elegant feminine aesthetic, rose gold and blush pink tones, soft floral and botanical elements, chic and sophisticated, dreamy light and airy atmosphere, luxe beauty editorial',
    neutro:     'warm neutral earthy palette, beige cream and sand tones, clean modern minimal, natural linen textures, sophisticated and timeless, soft natural light photography',
    retro:      'vintage retro aesthetic, film grain and light leaks, warm sepia and amber tones, 70s and 80s inspired, nostalgic cinematic feel, analog photography with vignette',
    // ── Avatar / Ilustração infantil ──
    infantil: 'bright cheerful cartoon illustration style, vibrant primary colors, playful rounded shapes, pastel rainbow accents, children book aesthetic, fun bubbly and energetic',
    pixar:    '3D CGI animation style inspired by Pixar and Disney, soft volumetric lighting, expressive rounded facial features, smooth subsurface skin shading, vibrant saturated colors, cinematic 3D render quality, professional character animation, NO photorealism',
    anime:    'Japanese anime illustration style, large expressive eyes, clean bold linework, vibrant cel-shaded flat colors, dynamic composition, manga-inspired aesthetic, professional anime production quality, illustrated NOT photographic',
    aquarela: 'delicate watercolor illustration style, soft painterly textures, translucent color washes, hand-painted artistic aesthetic, gentle gradients and bleeds, fine art quality, dreamy ethereal atmosphere, illustrated NOT photographic',
    flat:     'modern flat design vector illustration, bold geometric shapes, clean minimal linework, vivid solid colors, contemporary graphic design aesthetic, professional editorial illustration, NO depth or photography',
    cartoon:  'bold expressive cartoon illustration, thick playful outlines, bright oversaturated colors, exaggerated fun proportions, comic strip energy, professional animation studio quality, illustrated NOT photographic',
  };

  // Pure function — style and handle passed as params so they are locked at generation time
  const buildImagePrompt = (
    title: string,
    subtitle: string,
    imagePrompt: string,
    style: CarouselStyleModel,
    handle: string,
  ): string => {
    const styleDesc = STYLE_PROMPTS[style];
    const cleanHandle = handle || '@socialpro';
    return (
      `Instagram carousel slide, portrait 4:5 format, professional social media design. ` +
      `Visual scene: ${imagePrompt || 'cinematic illustration related to the slide topic'}. ` +
      `Visual style: ${styleDesc}. ` +
      `Typography: large bold white title text "${title}" placed in the upper third of the image; ` +
      `smaller white subtitle text "${subtitle}" centered below the title with clear line spacing; ` +
      `high contrast legible text, semi-transparent dark overlay behind text for readability if needed. ` +
      `Small watermark "${cleanHandle}" at the very bottom center in subtle white. ` +
      `Clean composition, no extra UI elements, no borders.`
    );
  };

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const startPolling = useCallback((carouselId: string, slideIds: string[]) => {
    stopPolling();
    currentCarouselIdRef.current = carouselId;
    let polls = 0;

    pollingRef.current = setInterval(async () => {
      polls++;
      // Stop after 3 min or if a new carousel replaced this one
      if (polls > 90 || currentCarouselIdRef.current !== carouselId) {
        stopPolling();
        setSlides(prev => prev.map(s => ({ ...s, isGeneratingImage: false })));
        return;
      }

      try {
        const res = await fetch(`/api/carousels/${carouselId}`);
        if (!res.ok) return;
        const { carousel } = await res.json();
        const dbSlides: Slide[] = carousel?.slides ?? [];

        setSlides(prev => {
          let changed = false;
          const next = prev.map(s => {
            const db = dbSlides.find(d => d.id === s.id);
            if (db?.imageUrl && !s.imageUrl) {
              changed = true;
              return { ...s, imageUrl: db.imageUrl, isGeneratingImage: false };
            }
            return s;
          });
          return changed ? next : prev;
        });

        const allDone = slideIds.every(id => dbSlides.find(s => s.id === id)?.imageUrl);
        if (allDone) stopPolling();
      } catch { /* silent */ }
    }, 2000);
  }, [stopPolling]);

  // Fallback: direct API generation (used when referenceImage is set)
  const generateSlideImagesDirect = useCallback(
    async (slidesToProcess: Slide[], style: CarouselStyleModel, handle: string, refImage: string) => {
      const BATCH = 2;
      for (let i = 0; i < slidesToProcess.length; i += BATCH) {
        const chunk = slidesToProcess.slice(i, i + BATCH);
        await Promise.allSettled(
          chunk.map(async (slide) => {
            const prompt = buildImagePrompt(slide.title, slide.subtitle, slide.imagePrompt || '', style, handle);
            setSlides(prev => prev.map(s => s.id === slide.id ? { ...s, isGeneratingImage: true } : s));
            try {
              const resp = await fetch('/api/ai/image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, referenceImage: refImage }),
              });
              if (resp.ok) {
                const data = await resp.json();
                setSlides(prev => prev.map(s => s.id === slide.id ? { ...s, imageUrl: data.imageUrl, isGeneratingImage: false } : s));
              } else {
                setSlides(prev => prev.map(s => s.id === slide.id ? { ...s, isGeneratingImage: false } : s));
              }
            } catch {
              setSlides(prev => prev.map(s => s.id === slide.id ? { ...s, isGeneratingImage: false } : s));
            }
          })
        );
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleLoginSuccess = (selectedPlan: string) => {
    setPlanName(selectedPlan);
  };

  const handleAddScheduledItem = (newItem: EditorialItem) => {
    setScheduledItems((prev) => [...prev, newItem]);
  };

  const handleDeleteScheduledItem = (id: string) => {
    setScheduledItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAIGenerate = async () => {
    if (!content.trim()) return;
    setIsGenerating(true);

    try {
      const response = await fetch('/api/ai/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, tone, aiBio: brandKit.aiBio }),
      });

      if (!response.ok) throw new Error('Falha no serviço.');
      const data = await response.json();
      const refinedText = data.refinedText;
      setContent(refinedText);

      const colors: Record<string, string> = {
        provocativo: 'linear-gradient(135deg, #f43f5e 0%, #ec4899 50%, #d946ef 100%)',
        storyteller: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
        meme: 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #f43f5e 100%)',
        autoridade: 'linear-gradient(135deg, #091e3a 0%, #2f80ed 50%, #2d9cdb 100%)',
      };

      const lines = refinedText.split('\n').filter((l: string) => l.trim().length > 5);
      const t1 = lines[0]?.substring(0, 30).toUpperCase().replace(/[#🚨⚠️🔒*]/g, '') || 'POST REFINADO';
      const s1 = lines[1]?.replace(/^[0-9.-]\s*/, '') || 'Roteiro de conteúdo de alta conversão.';
      const t2 = lines[2]?.substring(0, 30).toUpperCase().replace(/[#🚨⚠️🔒*]/g, '') || 'ESTRATÉGIA';
      const s2 = lines[3]?.replace(/^[0-9.-]\s*/, '') || 'Mantenha o foco em ganchos fortes.';

      setSlides([
        { id: 'as1', title: t1, subtitle: s1, background: colors[tone] },
        { id: 'as2', title: `01. ${t2}`, subtitle: s2, background: 'linear-gradient(135deg, #111827 0%, #1f2937 50%, #374151 100%)' },
        { id: 'as3', title: '02. AÇÃO PRÁTICA', subtitle: 'Aplique este checklist hoje mesmo e veja os resultados de engajamento.', background: colors[tone] },
      ]);
      setActiveSlideIndex(0);
      setIsGenerating(false);
    } catch {
      setIsGenerating(false);
    }
  };

  const handleGenerateCarousel = async () => {
    const topic = carouselTopic.trim();
    if (!topic || isGeneratingCarousel) return;

    // Lock style, handle and referenceImage at click time
    const lockedStyle  = styleModel;
    const lockedHandle = brandKit.brandHandle;
    const lockedRef    = referenceImage;

    setIsGeneratingCarousel(true);
    setLastCarouselSource(null);

    try {
      const response = await fetch('/api/ai/carousel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, tone, aiBio: brandKit.aiBio, slideCount: carouselSlideCount, styleDesc: STYLE_PROMPTS[lockedStyle] }),
      });

      // No active plan / quota reached → upgrade modal, NO local fallback.
      if (response.status === 402) {
        const errBody = await response.json().catch(() => ({}));
        setUpgradeReason(errBody?.reason === 'usage_limit_reached' ? 'usage_limit_reached' : 'subscription_required');
        setUpgradeModalOpen(true);
        setLastCarouselSource(null);
        setIsGeneratingCarousel(false);
        return;
      }

      if (!response.ok) throw new Error('Falha ao gerar o carrossel.');

      const data = await response.json();
      const generated: Slide[] = Array.isArray(data?.slides) ? data.slides : [];

      if (generated.length) {
        // Mark all slides as generating images
        setSlides(generated.map(s => ({ ...s, isGeneratingImage: true })));
        setActiveSlideIndex(0);
        setLastCarouselSource(data?.source === 'ai' ? 'ai' : 'fallback');
        setContent(
          data.caption ||
          `${generated[0].title}\n\n${generated[0].subtitle}\n\nDeslize ➡️ e salve este post para não esquecer.\n\n#${tone} #conteudo #socialpro`
        );

        // Save to DB first to get carouselId (needed by Windmill workers)
        const saveRes = await fetch('/api/carousels', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic, tone, style: lockedStyle, slideCount: carouselSlideCount,
            slides: generated, caption: data.caption ?? null, platform: 'instagram',
          }),
        });

        if (saveRes.ok) {
          const { id: carouselId } = await saveRes.json();

          currentCarouselIdRef.current = carouselId;
          // Refresh usage counter after successful save
          loadSubscription();

          if (lockedRef) {
            // Reference image: use direct API (Windmill doesn't support it yet)
            generateSlideImagesDirect(generated, lockedStyle, lockedHandle, lockedRef).catch(console.error);
          } else {
            // Enqueue all slides to Windmill workers
            const slidePrompts = generated.map((s, i) => ({
              slideIndex: i,
              prompt: buildImagePrompt(s.title, s.subtitle, s.imagePrompt || '', lockedStyle, lockedHandle),
            }));
            fetch(`/api/carousels/${carouselId}/generate-images`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ slides: slidePrompts, locale: 'pt' }),
            }).catch(console.error);
            startPolling(carouselId, generated.map(s => s.id));
          }
        } else if (saveRes.status === 402) {
          const errBody = await saveRes.json().catch(() => ({}));
          setUpgradeReason(errBody?.error === 'usage_limit_reached' ? 'usage_limit_reached' : 'subscription_required');
          setUpgradeModalOpen(true);
          setSlides([]);
        } else if (saveRes.status === 503) {
          // Subscription service unavailable — still generate images directly
          console.warn('[carousel] subscription check unavailable, falling back to direct API');
          generateSlideImagesDirect(generated, lockedStyle, lockedHandle, lockedRef ?? '').catch(console.error);
        } else {
          // DB save failed — fallback to direct API
          console.warn('[carousel] save failed, falling back to direct API:', saveRes.status);
          generateSlideImagesDirect(generated, lockedStyle, lockedHandle, lockedRef ?? '').catch(console.error);
        }
      }
    } catch {
      // Local fallback
      const colors = [
        'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #c084fc 100%)',
        'linear-gradient(135deg, #0891b2 0%, #06b6d4 50%, #22d3ee 100%)',
        'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #f43f5e 100%)',
        'linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #f43f5e 100%)',
        'linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)',
      ];
      const topic = carouselTopic.trim();
      const count = Math.min(Math.max(carouselSlideCount, 3), 8);
      const short = topic.length > 38 ? `${topic.slice(0, 38)}…` : topic;
      const localSlides: Slide[] = [
        { id: `lf1-${Math.random().toString(36).slice(2, 8)}`, title: 'A VERDADE QUE NINGUÉM TE CONTA', subtitle: `Tudo sobre ${short} em ${count} slides. Deslize até o fim. ➡️`, background: colors[0] },
      ];
      for (let i = 1; i < count - 1; i++) {
        localSlides.push({ id: `lf${i + 1}-${Math.random().toString(36).slice(2, 8)}`, title: `0${i}. PONTO-CHAVE`, subtitle: `Aplique este passo sobre ${short} hoje mesmo.`, background: colors[i % colors.length] });
      }
      localSlides.push({ id: `lf${count}-${Math.random().toString(36).slice(2, 8)}`, title: 'SALVE ESTE POST', subtitle: `Curtiu? Comente "EU QUERO" e siga para mais sobre ${short}.`, background: colors[(count - 1) % colors.length] });
      setSlides(localSlides.map(s => ({ ...s, isGeneratingImage: true })));
      setActiveSlideIndex(0);
      setLastCarouselSource('fallback');
      generateSlideImagesDirect(localSlides, lockedStyle, lockedHandle, lockedRef ?? '').catch(console.error);
    } finally {
      setIsGeneratingCarousel(false);
    }
  };

  const handleRegenerateSlideImage = useCallback(
    async (slideId: string, title: string, subtitle: string, imagePrompt: string) => {
      const prompt = buildImagePrompt(title, subtitle, imagePrompt, styleModel, brandKit.brandHandle);
      const carouselId = currentCarouselIdRef.current;

      setSlides((prev) =>
        prev.map((s) => (s.id === slideId ? { ...s, isGeneratingImage: true, imageUrl: undefined } : s))
      );

      if (carouselId && !referenceImage) {
        // Route through Windmill — same pipeline as the initial generation
        const slideIndex = slides.findIndex(s => s.id === slideId);
        fetch(`/api/carousels/${carouselId}/generate-images`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slides: [{ slideIndex, prompt }] }),
        }).catch(console.error);
        startPolling(carouselId, [slideId]);
        return;
      }

      // Fallback: direct API (when no carouselId or referenceImage active)
      try {
        const resp = await fetch('/api/ai/image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, referenceImage }),
        });
        if (resp.ok) {
          const data = await resp.json();
          setSlides((prev) =>
            prev.map((s) =>
              s.id === slideId ? { ...s, imageUrl: data.imageUrl, isGeneratingImage: false } : s
            )
          );
        } else {
          setSlides((prev) =>
            prev.map((s) => (s.id === slideId ? { ...s, isGeneratingImage: false } : s))
          );
        }
      } catch {
        setSlides((prev) =>
          prev.map((s) => (s.id === slideId ? { ...s, isGeneratingImage: false } : s))
        );
      }
    },
    [styleModel, brandKit.brandHandle, referenceImage, slides, startPolling]
  );

  const handleRegenerateAllImages = useCallback(async () => {
    const lockedStyle  = styleModel;
    const lockedHandle = brandKit.brandHandle;
    const lockedRef    = referenceImage;
    const carouselId   = currentCarouselIdRef.current;

    setSlides(prev => prev.map(s => ({ ...s, isGeneratingImage: true, imageUrl: undefined })));

    if (lockedRef || !carouselId) {
      // No carouselId or has reference → direct API
      await generateSlideImagesDirect(slides, lockedStyle, lockedHandle, lockedRef ?? '');
      return;
    }

    const slidePrompts = slides.map((s, i) => ({
      slideIndex: i,
      prompt: buildImagePrompt(s.title, s.subtitle, s.imagePrompt || '', lockedStyle, lockedHandle),
    }));

    fetch(`/api/carousels/${carouselId}/generate-images`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slides: slidePrompts, locale: 'pt' }),
    }).catch(console.error);

    startPolling(carouselId, slides.map(s => s.id));
  }, [styleModel, brandKit.brandHandle, referenceImage, slides, generateSlideImagesDirect, startPolling]);

  const handleRefineCaption = async () => {
    if (!content.trim() || isGenerating) return;
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, tone, aiBio: brandKit.aiBio }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data?.refinedText) setContent(data.refinedText);
      }
    } catch {
      // silent
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateTextPost = async () => {
    const topic = carouselTopic.trim();
    if (!topic || isGenerating) return;
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: topic, tone, aiBio: brandKit.aiBio }),
      });
      if (!response.ok) throw new Error('Falha ao gerar o post.');
      const data = await response.json();
      if (data?.refinedText) { setContent(data.refinedText); return; }
      throw new Error('Resposta vazia.');
    } catch {
      const hooks: Record<ToneType, string> = {
        provocativo: `A verdade incômoda sobre ${carouselTopic}:`,
        autoridade: `3 lições práticas sobre ${carouselTopic} que poucos aplicam:`,
        storyteller: `Demorei pra entender isso sobre ${carouselTopic}. Hoje compartilho:`,
        meme: `Eu tentando dominar ${carouselTopic} às 3h da manhã:`,
      };
      setContent(`${hooks[tone]}\n\n1. Comece pelo essencial, não pelo perfeito.\n2. Consistência vence intensidade.\n3. Documente o processo, não só o resultado.\n\nO que você faria diferente? Comenta aí 👇`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectItem = (item: EditorialItem) => {
    setSelectedItemId(item.id);
    setPlatform(item.platform);
    if (item.id === 'c3') {
      setContent(`🚀 A maioria dos criadores está perdendo tempo criando posts irrelevantes.\n\nEu costumava postar todos os dias, mas os resultados eram medíocres. Depois de analisar mais de 500 postagens virais, entendi que o segredo é a consistência estratégica:\n\n1. Ganchos de alta fricção\n2. Distribuição visual (carrosséis estruturados)\n3. CTAs acionáveis\n\nQuer receber meu checklist completo? Comente 'SOCIAL' abaixo e eu te envio na hora!`);
      setSlides(INITIAL_SLIDES);
    } else if (item.id === 'c4') {
      setContent(`🚨 ATENÇÃO STRIPE E GITHUB: Login alterado!\n\nA ajuda oficial informa que o botão de autenticação automática pelo GitHub e Facebook foi desativado por questões de segurança. O acesso agora migrou para e-mail ou Google.\n\nVeja as instruções completas nos slides ao lado ➡️`);
      setSlides(INITIAL_SLIDES);
    } else {
      setContent(`Rascunho de post sobre: ${item.title}.\n\nEdite este texto no painel.`);
      setSlides([{ id: 'rs1', title: item.title, subtitle: 'Rascunho editável do post semanal.', background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)' }]);
    }
    setActiveSlideIndex(0);
  };

  const handleSelectIdea = (hook: string, structure: string) => {
    setContent(`${hook}\n\n[Estrutura sugerida:]\n${structure}`);
  };

  return (
    <AppContext.Provider value={{
      subscription, loadSubscription,
      profileLoaded,
    brandKit, setBrandKit,
      planName, setPlanName: handleLoginSuccess,
      styleModel, setStyleModel,
      watermarkType, setWatermarkType,
      platform, setPlatform,
      tone, setTone,
      content, setContent,
      slides, setSlides,
      activeSlideIndex, setActiveSlideIndex,
      isGenerating, setIsGenerating,
      carouselTopic, setCarouselTopic,
      carouselSlideCount, setCarouselSlideCount,
      referenceImage, setReferenceImage,
      isGeneratingCarousel,
      lastCarouselSource,
      scheduledItems, setScheduledItems,
      selectedItemId, setSelectedItemId,
      handleLoginSuccess,
      handleAddScheduledItem,
      handleDeleteScheduledItem,
      handleAIGenerate,
      handleGenerateCarousel,
      handleRegenerateSlideImage,
      handleRegenerateAllImages,
      handleRefineCaption,
      handleGenerateTextPost,
      handleSelectItem,
      handleSelectIdea,
      upgradeModalOpen, setUpgradeModalOpen, upgradeReason,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within an AppContextProvider');
  return context;
};
