import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { hasActivePlan } from '@/lib/subscription';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string } | undefined)?.id ?? session?.user?.email;
    if (!userId) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    if (!(await hasActivePlan(userId))) {
      return NextResponse.json({ error: 'subscription_required', reason: 'subscription_required' }, { status: 402 });
    }

    const { topic, tone, slides, aiBio } = await request.json();
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'OPENAI_API_KEY não configurada.' }, { status: 400 });

    const openai = new OpenAI({ apiKey });

    const slideSummary = Array.isArray(slides)
      ? slides.map((s: { title: string; subtitle: string }, i: number) => `Slide ${i + 1}: ${s.title} — ${s.subtitle}`).join('\n')
      : '';

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Você é um copywriter especialista em Instagram. Gere 3 legendas DIFERENTES e COMPLETAS para o mesmo carrossel, cada uma com um ângulo diferente.

CONTEXTO DO CRIADOR: "${aiBio || 'Criador de conteúdo digital'}"
TOM: ${tone || 'autoridade'}

Cada legenda deve ter:
- Gancho forte na primeira linha (para o scroll parar)
- Desenvolvimento em 2-3 parágrafos
- CTA específico e urgente
- 8-10 hashtags de nicho relevantes
- Entre 300-600 caracteres

Retorne JSON: {"variations": [{"angle": "nome do ângulo", "caption": "legenda completa"}, ...]}
3 variações com ângulos diferentes: emocional, prático, provocativo.`,
        },
        {
          role: 'user',
          content: `Tema: "${topic}"\n\nSlides do carrossel:\n${slideSummary}\n\nGere 3 variações de legenda.`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.8,
    });

    const raw = response.choices[0].message.content || '{}';
    const parsed = JSON.parse(raw);

    return NextResponse.json({ variations: parsed.variations ?? [] });
  } catch (err) {
    console.error('[caption-variations]', err);
    return NextResponse.json({ error: 'Erro ao gerar variações.' }, { status: 500 });
  }
}
