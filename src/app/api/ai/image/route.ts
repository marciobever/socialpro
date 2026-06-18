import { NextResponse } from 'next/server';
import OpenAI, { toFile } from 'openai';

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OPENAI_API_KEY não configurada.' }, { status: 400 });
    }

    const { prompt, referenceImage } = await request.json();
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt é obrigatório.' }, { status: 400 });
    }

    const openai = new OpenAI({ apiKey });

    let imageData: OpenAI.Images.Image | undefined;

    if (referenceImage) {
      // Use images.edit — reference image drives the visual consistency
      const base64 = (referenceImage as string).replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64, 'base64');
      const imageFile = await toFile(buffer, 'reference.png', { type: 'image/png' });

      const resp = await openai.images.edit({
        model: 'gpt-image-2',
        image: imageFile,
        prompt,
        n: 1,
        size: '1024x1536',
        quality: 'low',
      } as Parameters<typeof openai.images.edit>[0]) as OpenAI.ImagesResponse;

      imageData = resp.data?.[0];
    } else {
      // Standard generation — no reference
      const resp = await openai.images.generate({
        model: 'gpt-image-2',
        prompt,
        n: 1,
        size: '1024x1536',
        quality: 'low',
      });

      imageData = resp.data?.[0];
    }

    if (!imageData) {
      return NextResponse.json({ error: 'Sem dados de imagem na resposta.' }, { status: 500 });
    }

    let imageUrl: string | undefined;
    if ('b64_json' in imageData && imageData.b64_json) {
      imageUrl = `data:image/png;base64,${imageData.b64_json}`;
    } else if ('url' in imageData && imageData.url) {
      imageUrl = imageData.url;
    }

    if (!imageUrl) {
      return NextResponse.json({ error: 'Sem dados de imagem na resposta.' }, { status: 500 });
    }

    return NextResponse.json({ imageUrl });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Erro ao gerar imagem: ${message}` }, { status: 500 });
  }
}
