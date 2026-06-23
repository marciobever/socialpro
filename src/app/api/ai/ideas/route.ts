import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: Request) {
  try {
    const { niche, tone, aiBio } = await request.json();
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'OPENAI_API_KEY não configurada.' }, { status: 400 });

    const openai = new OpenAI({ apiKey });

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Você é um estrategista de conteúdo viral para Instagram especializado em carrosséis de alto engajamento.

CONTEXTO DO CRIADOR: "${aiBio || 'Criador de conteúdo digital'}"
TOM: ${tone || 'autoridade'}

Gere 6 ideias de carrossel com altíssimo potencial viral para o nicho informado.

Cada ideia deve ter:
- "title": título do carrossel (máximo 8 palavras, em CAPS)
- "hook": primeiro slide/gancho (1 frase irresistível)
- "why": por que vai viralizar (1 frase)
- "slides": número ideal de slides (3-8)
- "tone": tom ideal (provocativo/autoridade/storyteller/meme)

Retorne JSON: {"ideas": [{...}, ...]}`,
        },
        {
          role: 'user',
          content: `Nicho: "${niche || 'marketing digital'}"\nGere 6 ideias de carrossel viral.`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.9,
    });

    const raw = response.choices[0].message.content || '{}';
    const parsed = JSON.parse(raw);

    return NextResponse.json({ ideas: parsed.ideas ?? [] });
  } catch (err) {
    console.error('[ideas]', err);
    return NextResponse.json({ error: 'Erro ao gerar ideias.' }, { status: 500 });
  }
}
