import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const TONE_INSTRUCTIONS: Record<string, string> = {
  provocativo: 'Crie ganchos desafiadores, questione ideias tradicionais e estimule o engajamento através de provocações inteligentes.',
  autoridade: 'Use dados estruturados, termos técnicos simplificados e tom professoral direto. Mostre que domina o assunto.',
  storyteller: 'Crie uma narrativa envolvente baseada no cotidiano, jornada ou aprendizados. Gere empatia.',
  meme: 'Tom descontraído, engraçado, sarcástico e pronto para gerar compartilhamentos informais.',
};

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OPENAI_API_KEY não configurada.' }, { status: 400 });
    }

    const { content, tone, aiBio, instruction } = await request.json();
    if (!content) {
      return NextResponse.json({ error: 'O conteúdo original é obrigatório.' }, { status: 400 });
    }

    const extraInstruction = typeof instruction === 'string' && instruction.trim()
      ? `\n\nAJUSTE PRIORITÁRIO SOLICITADO: ${instruction.trim()} (aplique isso acima de tudo, mantendo o sentido).`
      : '';

    const openai = new OpenAI({ apiKey });

    const response = await openai.chat.completions.create({
      model: 'gpt-5.4-mini',
      messages: [
        {
          role: 'system',
          content: `Você é um redator publicitário de elite especializado em mídias sociais (LinkedIn e Instagram).
Refine o rascunho do usuário tornando-o magnético, persuasivo e adequado ao algoritmo.

BIO DO USUÁRIO: "${aiBio || 'Criador de conteúdo e especialista de marketing.'}"
TOM DE VOZ: "${(tone || 'autoridade').toUpperCase()}" — ${TONE_INSTRUCTIONS[tone] || TONE_INSTRUCTIONS.autoridade}

REGRAS:
- Retorne APENAS o texto do post refinado, pronto para publicação.
- Sem saudações, introduções ou explicações.
- Espaçamento limpo entre linhas (estilo microblogging).
- Gancho forte nas primeiras duas linhas.
- Finalize com CTA sutil para comentários ou compartilhamentos.${extraInstruction}`,
        },
        {
          role: 'user',
          content: `Rascunho a refinar:\n\n"${content}"`,
        },
      ],
      temperature: 0.9,
    });

    const refinedText = response.choices[0].message.content?.trim();
    if (!refinedText) {
      return NextResponse.json({ error: 'Resposta vazia do modelo.' }, { status: 500 });
    }

    return NextResponse.json({ refinedText });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Erro interno: ${message}` }, { status: 500 });
  }
}
