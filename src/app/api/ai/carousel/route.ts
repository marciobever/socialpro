import { NextResponse } from 'next/server';
import OpenAI from 'openai';

type GeneratedSlide = { title: string; subtitle: string; imagePrompt: string };
type CarouselResponse = { slides: GeneratedSlide[]; caption?: string };

const TONE_HINTS: Record<string, string> = {
  provocativo: 'Ganchos desafiadores que quebram crenças. Provoque, questione o senso comum, gere desconforto produtivo.',
  autoridade: 'Tom professoral e técnico. Use dados e termos precisos. Demonstre domínio total do assunto.',
  storyteller: 'Construa uma narrativa com começo, tensão e virada. Gere empatia e identificação a cada slide.',
  meme: 'Tom descontraído, sarcástico e divertido. Frases curtas, prontas para compartilhar.',
};

function safeParseCarousel(raw: string): CarouselResponse | null {
  const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) return null;
  try {
    const parsed = JSON.parse(cleaned.slice(start, end + 1));
    if (!Array.isArray(parsed?.slides)) return null;
    const slides = parsed.slides
      .filter((s: unknown): s is GeneratedSlide => {
        const slide = s as Record<string, unknown>;
        return typeof slide?.title === 'string' && typeof slide?.subtitle === 'string';
      })
      .map((s: GeneratedSlide) => ({
        title: s.title.trim(),
        subtitle: s.subtitle.trim(),
        imagePrompt: typeof s.imagePrompt === 'string' ? s.imagePrompt.trim() : '',
      }));
    if (!slides.length) return null;
    return {
      slides,
      caption: typeof parsed.caption === 'string' ? parsed.caption.trim() : undefined,
    };
  } catch {
    return null;
  }
}

function withIds(slides: GeneratedSlide[]) {
  return slides.map((s, i) => ({
    id: `g${i + 1}-${Math.random().toString(36).slice(2, 8)}`,
    title: s.title,
    subtitle: s.subtitle,
    background: 'linear-gradient(135deg, #0b0c10 0%, #171923 100%)',
    imagePrompt: s.imagePrompt,
  }));
}

function fallbackSlides(topic: string, tone: string, slideCount: number): GeneratedSlide[] {
  const short = topic.length > 38 ? `${topic.slice(0, 38)}…` : topic;
  const hooks: Record<string, string> = {
    provocativo: 'A VERDADE QUE NINGUÉM TE CONTA',
    autoridade: 'O FRAMEWORK COMPLETO',
    storyteller: 'COMO TUDO COMEÇOU',
    meme: 'NINGUÉM ESTAVA PRONTO PRA ISSO',
  };
  const slides: GeneratedSlide[] = [
    {
      title: hooks[tone] || hooks.autoridade,
      subtitle: `Tudo sobre ${short} em ${slideCount} slides. Deslize até o fim. ➡️`,
      imagePrompt: `Dramatic cinematic illustration representing "${topic}", dark atmospheric, premium aesthetic`,
    },
  ];
  for (let i = 1; i < slideCount - 1; i++) {
    slides.push({
      title: `0${i}. PONTO-CHAVE`,
      subtitle: `Aplique este passo sobre ${short} hoje mesmo e veja a diferença.`,
      imagePrompt: `Modern conceptual dark illustration for step ${i} about "${topic}"`,
    });
  }
  slides.push({
    title: 'SALVE ESTE POST',
    subtitle: `Curtiu? Comente "EU QUERO" e siga para mais sobre ${short}.`,
    imagePrompt: `Dark premium call-to-action social media visual about "${topic}"`,
  });
  return slides.slice(0, slideCount);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const topic: string = (body?.topic || '').toString().trim();
    const tone: string = (body?.tone || 'autoridade').toString();
    const aiBio: string = (body?.aiBio || '').toString();
    const styleDesc: string = (body?.styleDesc || 'dark cinematic aesthetic, moody dramatic lighting, premium editorial quality').toString();
    const slideCount = Math.min(Math.max(parseInt(body?.slideCount, 10) || 5, 3), 8);

    if (!topic) {
      return NextResponse.json({ error: 'Informe um tema para gerar o carrossel.' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        slides: withIds(fallbackSlides(topic, tone, slideCount)),
        source: 'fallback',
      });
    }

    const openai = new OpenAI({ apiKey });

    // Step 1: Real-time web search via OpenAI Responses API
    let research = '';
    try {
      const searchResponse = await openai.responses.create({
        model: 'gpt-5.4-mini',
        tools: [{ type: 'web_search_preview' }],
        input: `Pesquise na web informações atuais e verificáveis sobre: "${topic}".
Traga dados concretos, fatos reais, números, nomes, datas e exemplos relevantes encontrados agora.
IMPORTANTE: use APENAS informações reais. Nunca invente dados.
Responda em português.`,
      } as Parameters<typeof openai.responses.create>[0]);

      research = (searchResponse as { output_text?: string }).output_text ?? '';
    } catch (searchErr) {
      console.error('Web search falhou, continuando sem pesquisa:', searchErr);
    }

    // Step 2: Structure researched data into carousel slides
    const structureResponse = await openai.chat.completions.create({
      model: 'gpt-5.4-mini',
      messages: [
        {
          role: 'system',
          content: `Você é um criador de conteúdo viral de elite para Instagram.
Crie carrosséis com base em dados REAIS da pesquisa fornecida — NUNCA invente informações.

CONTEXTO DO CRIADOR: "${aiBio || 'Criador de conteúdo e especialista de marketing.'}"
TOM DE VOZ: "${tone.toUpperCase()}" — ${TONE_HINTS[tone] || TONE_HINTS.autoridade}

REGRAS DE CADA SLIDE:
- "title": máximo 6 palavras em CAIXA ALTA, sem emojis, sem aspas
- "subtitle": 2-3 frases ricas, máximo 200 caracteres. Use dados concretos, números reais, exemplos específicos. Nunca frases genéricas como "salve e compartilhe" — isso vai no último slide apenas.
- "imagePrompt": cena visual ÚNICA e ESPECÍFICA do item deste slide, em inglês detalhado.
  Estilo visual obrigatório para todos os slides: "${styleDesc}".
  OBRIGATÓRIO: cada slide deve ter imagePrompt completamente diferente dos outros.
  Para listas (ex: animes, filmes, apps), descreva a cena visual daquele item específico dentro do estilo acima.
  NUNCA repita o mesmo imagePrompt. Descreva ambiente, cores, objetos, emoção — sem mencionar texto.

ESTRUTURA OBRIGATÓRIA:
- Slide 1: gancho de alta fricção (para o scroll) — imagePrompt: cena de impacto geral do tema
- Slides do meio: 1 item por slide com dado real — imagePrompt: cena EXCLUSIVA daquele item específico
- Último slide: CTA (salvar, comentar, seguir) — imagePrompt: cena motivacional de encerramento

Retorne APENAS JSON válido:
{"slides":[{"title":"...","subtitle":"...","imagePrompt":"..."}, ...],"caption":"..."}
Array de slides com EXATAMENTE ${slideCount} itens.
"caption": legenda COMPLETA para Instagram. Mínimo 3 parágrafos: (1) gancho emocional de 1 linha que para o scroll, (2) desenvolvimento com insight real do tema, (3) CTA específico e urgente. Termine com 8-12 hashtags nicho relevantes. Entre 400-800 caracteres no total. NÃO use o título do slide como gancho — crie algo novo e mais profundo.`,
        },
        {
          role: 'user',
          content: research
            ? `Dados reais encontrados na web sobre "${topic}":\n\n${research}\n\nCrie o carrossel com exatamente ${slideCount} slides usando APENAS esses dados reais.`
            : `Crie um carrossel sobre "${topic}" com exatamente ${slideCount} slides usando seus conhecimentos sobre o tema.`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const rawText = structureResponse.choices[0].message.content || '';
    const parsed = safeParseCarousel(rawText);

    if (!parsed || parsed.slides.length === 0) {
      return NextResponse.json({
        slides: withIds(fallbackSlides(topic, tone, slideCount)),
        source: 'fallback',
      });
    }

    return NextResponse.json({
      slides: withIds(parsed.slides.slice(0, slideCount)),
      caption: parsed.caption,
      source: 'ai',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Erro interno: ${message}` }, { status: 500 });
  }
}
