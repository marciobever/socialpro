import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const WINDMILL_URL      = process.env.WINDMILL_URL;
const WINDMILL_TOKEN    = process.env.WINDMILL_TOKEN;
const WINDMILL_WS       = process.env.WINDMILL_WORKSPACE;
const WINDMILL_SCRIPT   = process.env.WINDMILL_SCRIPT_PATH;

async function enqueueJob(payload: object, url: string, token: string, ws: string, script: string): Promise<string> {
  const res = await fetch(
    `${url}/api/w/${ws}/jobs/run/p/${script}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );
  if (!res.ok) throw new Error(`Windmill enqueue failed: ${res.status} ${await res.text()}`);
  return res.text(); // job UUID
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }

  const { id: carouselId } = await params;

  if (!WINDMILL_URL || !WINDMILL_TOKEN || !WINDMILL_WS || !WINDMILL_SCRIPT) {
    console.error('[generate-images] Windmill env vars ausentes:', {
      WINDMILL_URL: !!WINDMILL_URL,
      WINDMILL_TOKEN: !!WINDMILL_TOKEN,
      WINDMILL_WORKSPACE: !!WINDMILL_WS,
      WINDMILL_SCRIPT_PATH: !!WINDMILL_SCRIPT,
    });
    return NextResponse.json(
      { error: 'Windmill não configurado. Defina WINDMILL_URL, WINDMILL_TOKEN, WINDMILL_WORKSPACE e WINDMILL_SCRIPT_PATH.' },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    // slides: Array<{ slideIndex: number; prompt: string }>
    const { slides, locale = 'pt' } = body as {
      slides: { slideIndex: number; prompt: string }[];
      locale?: string;
    };

    if (!Array.isArray(slides) || slides.length === 0) {
      return NextResponse.json({ error: 'slides array obrigatório.' }, { status: 400 });
    }

    // Enqueue all slides immediately — Windmill workers handle concurrency
    const jobIds = await Promise.all(
      slides.map(({ slideIndex, prompt }) =>
        enqueueJob({ prompt, carousel_id: carouselId, slide_index: slideIndex, locale }, WINDMILL_URL!, WINDMILL_TOKEN!, WINDMILL_WS!, WINDMILL_SCRIPT!)
      )
    );

    return NextResponse.json({ jobIds, enqueued: jobIds.length });
  } catch (err) {
    console.error('[generate-images] error:', err);
    return NextResponse.json({ error: 'Erro ao enfileirar jobs.' }, { status: 500 });
  }
}
