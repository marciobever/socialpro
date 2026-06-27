import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { hasActivePlan } from '@/lib/subscription';

const TONE_INSTRUCTIONS: Record<string, string> = {
  provocativo: 'Crie ganchos desafiadores, questione ideias tradicionais e estimule o engajamento através de provocações inteligentes.',
  autoridade: 'Use dados estruturados, termos técnicos simplificados e tom professoral direto. Mostre que domina o assunto.',
  storyteller: 'Crie uma narrativa envolvente baseada no cotidiano, jornada ou aprendizados. Gere empatia.',
  meme: 'Tom descontraído, engraçado, sarcástico e pronto para gerar compartilhamentos informais.',
};

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string } | undefined)?.id ?? session?.user?.email;
    if (!userId) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    if (!(await hasActivePlan(userId))) {
      return NextResponse.json({ error: 'subscription_required', reason: 'subscription_required' }, { status: 402 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OPENAI_API_KEY não configurada.' }, { status: 400 });
    }

    const { content, tone, aiBio, instruction, platform } = await request.json();
    if (!content) {
      return NextResponse.json({ error: 'O conteúdo original é obrigatório.' }, { status: 400 });
    }

    const extraInstruction = typeof instruction === 'string' && instruction.trim()
      ? `\n\nAJUSTE PRIORITÁRIO SOLICITADO: ${instruction.trim()} (aplique isso acima de tudo, mantendo o sentido).`
      : '';

    const openai = new OpenAI({ apiKey });

    let systemPrompt = '';
    const cleanTone = tone || 'autoridade';
    const toneInstruction = TONE_INSTRUCTIONS[cleanTone] || TONE_INSTRUCTIONS.autoridade;

    if (platform === 'x') {
      systemPrompt = `Você é um redator publicitário de elite especialista em X (Twitter).
Refine o rascunho do usuário tornando-o magnético, conciso e com alto potencial de engajamento no X.

BIO DO USUÁRIO: "${aiBio || 'Criador de conteúdo e especialista.'}"
TOM DE VOZ: "${cleanTone.toUpperCase()}" — ${toneInstruction}

REGRAS ESTRITAS DO X:
- O texto final deve conter no MÁXIMO 280 caracteres. Mantenha-o extremamente curto e focado!
- Sem hashtags (ou no máximo 1 hashtag).
- Sem saudações, introduções ou explicações. Retorne APENAS o tweet pronto.
- Use ganchos muito diretos e estilo microblogging simples (frases curtas, espaçadas).${extraInstruction}`;
    } else if (platform === 'linkedin') {
      systemPrompt = `Você é um redator publicitário de elite especialista em LinkedIn.
Refine o rascunho do usuário transformando-o em um artigo/post de alta autoridade para o LinkedIn.

BIO DO USUÁRIO: "${aiBio || 'Especialista e criador de conteúdo no LinkedIn.'}"
TOM DE VOZ: "${cleanTone.toUpperCase()}" — ${toneInstruction}

REGRAS DO LINKEDIN:
- Retorne APENAS o texto refinado pronto para publicação. Sem introduções ou explicações.
- Escreva de forma profissional, com ganchos maduros nas primeiras duas linhas.
- Estruture o texto com bom espaçamento (estilo microblogging profissional), usando listas por tópicos ou numéricas se necessário.
- Use no máximo 3 hashtags relevantes no final do texto.
- Finalize com uma chamada para ação (CTA) que convide os usuários a comentarem/debaterem profissionalmente.${extraInstruction}`;
    } else {
      // Instagram / Outros
      systemPrompt = `Você é um redator publicitário de elite especializado em mídias sociais (Instagram).
Refine o rascunho do usuário tornando-o magnético, persuasivo e adequado ao algoritmo do Instagram.

BIO DO USUÁRIO: "${aiBio || 'Criador de conteúdo e especialista de marketing.'}"
TOM DE VOZ: "${cleanTone.toUpperCase()}" — ${toneInstruction}

REGRAS:
- Retorne APENAS o texto do post refinado, pronto para publicação.
- Sem saudações, introduções ou explicações.
- Espaçamento limpo entre linhas (estilo microblogging).
- Gancho forte nas primeiras duas linhas.
- Finalize com CTA sutil para comentários ou salvamento.
- Use 5 a 10 hashtags relevantes no final.${extraInstruction}`;
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-5.4-mini',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
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
