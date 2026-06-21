import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const WINDMILL_URL      = process.env.WINDMILL_URL!;
const WINDMILL_TOKEN    = process.env.WINDMILL_TOKEN!;
const WINDMILL_WS       = process.env.WINDMILL_WORKSPACE!;
const WINDMILL_SCRIPT   = process.env.WINDMILL_SCRIPT_PATH!;

async function enqueueJob(payload: object): Promise<string> {
  const res = await fetch(
    `${WINDMILL_URL}/api/w/${WINDMILL_WS}/jobs/run/p/${WINDMILL_SCRIPT}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${WINDMILL_TOKEN}`,
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
        enqueueJob({ prompt, carousel_id: carouselId, slide_index: slideIndex, locale })
      )
    );

    return NextResponse.json({ jobIds, enqueued: jobIds.length });
  } catch (err) {
    console.error('[generate-images] error:', err);
    return NextResponse.json({ error: 'Erro ao enfileirar jobs.' }, { status: 500 });
  }
}
