import { NextResponse } from 'next/server';
import { getServerSession, type Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';

function getUserId(session: Session) {
  return (session.user as { id?: string }).id ?? session.user?.email ?? 'unknown';
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const userId = getUserId(session);

  const { data } = await getSupabase()
    .from('profiles')
    .select('brand_name, brand_handle, avatar_url, ai_bio')
    .eq('user_id', userId)
    .single();

  return NextResponse.json({
    brandName:   data?.brand_name   ?? '',
    brandHandle: data?.brand_handle ?? '',
    avatarUrl:   data?.avatar_url   ?? '',
    aiBio:       data?.ai_bio       ?? '',
  });
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const userId = getUserId(session);

  try {
    const { brandName, brandHandle, aiBio, avatarUrl } = await request.json();

    let finalAvatarUrl: string = avatarUrl ?? '';

    // If it's a base64 data URL, upload to Supabase Storage
    if (finalAvatarUrl.startsWith('data:')) {
      const base64 = finalAvatarUrl.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64, 'base64');
      const path   = `avatars/${userId}.jpg`;

      const { error: uploadError } = await getSupabase()
        .storage
        .from('carousel-images')
        .upload(path, buffer, { contentType: 'image/jpeg', upsert: true });

      if (uploadError) throw new Error('Upload do avatar falhou: ' + uploadError.message);

      const { data: { publicUrl } } = getSupabase()
        .storage
        .from('carousel-images')
        .getPublicUrl(path);

      finalAvatarUrl = publicUrl;
    }

    const { error } = await getSupabase()
      .from('profiles')
      .upsert(
        {
          user_id:      userId,
          brand_name:   brandName   ?? '',
          brand_handle: brandHandle ?? '',
          avatar_url:   finalAvatarUrl,
          ai_bio:       aiBio       ?? '',
        },
        { onConflict: 'user_id' }
      );

    if (error) throw error;

    return NextResponse.json({ ok: true, avatarUrl: finalAvatarUrl });
  } catch (err) {
    console.error('[profile] save error:', err);
    return NextResponse.json({ error: 'Erro ao salvar perfil.' }, { status: 500 });
  }
}
