import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const res = await fetch(imageUrl);
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: res.status });
    }

    const blob = await res.blob();
    const headers = new Headers();
    headers.set('Content-Type', blob.type || 'image/png');
    headers.set('Cache-Control', 'public, max-age=86400');
    headers.set('Access-Control-Allow-Origin', '*');

    return new Response(blob, {
      status: 200,
      headers,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
