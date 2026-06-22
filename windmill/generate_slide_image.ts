// Windmill script: u/bevervansomarcio/socialpro/generate_slide_image
// Workspace: foodsnap — https://windmill.seureview.com.br
//
// Variáveis Windmill necessárias:
//   u/bevervansomarcio/OPENAI_API_KEY
//   u/bevervansomarcio/SUPABASE_URL
//   u/bevervansomarcio/SUPABASE_SERVICE_ROLE_KEY

import * as wmill from 'windmill-client';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';


export async function main(
  prompt: string,
  carousel_id: string,
  slide_index: number,
  locale: 'pt' | 'en' | 'es' = 'pt',
) {
  const openaiKey   = await wmill.getVariable('u/bevervansomarcio/OPENAI_API_KEY');
  const supabaseUrl = await wmill.getVariable('u/bevervansomarcio/SUPABASE_URL');
  const supabaseKey = await wmill.getVariable('u/bevervansomarcio/SUPABASE_SERVICE_ROLE_KEY');

  const openai   = new OpenAI({ apiKey: openaiKey });
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Generate image with gpt-image-2
  const response = await openai.images.generate({
    model: 'gpt-image-2',
    prompt,
    size: '1024x1536',
    quality: 'low',
    n: 1,
  });

  const imageData = response.data[0] as any;
  let imageBytes: Buffer;

  if (imageData.b64_json) {
    imageBytes = Buffer.from(imageData.b64_json, 'base64');
  } else if (imageData.url) {
    const imgRes = await fetch(imageData.url);
    imageBytes = Buffer.from(await imgRes.arrayBuffer());
  } else {
    throw new Error('Sem dados de imagem na resposta da OpenAI');
  }

  // Upload to Supabase Storage
  const fileName = `${carousel_id}/slide_${slide_index}.png`;
  const { error: uploadError } = await supabase.storage
    .from('carousel-images')
    .upload(fileName, imageBytes, { contentType: 'image/png', upsert: true });

  if (uploadError) throw new Error('Upload failed: ' + uploadError.message);

  const { data: { publicUrl } } = supabase.storage
    .from('carousel-images')
    .getPublicUrl(fileName);

  // Update slides JSONB in the carousel row
  const { data: carousel, error: fetchError } = await supabase
    .from('carousels')
    .select('slides')
    .eq('id', carousel_id)
    .single();

  if (fetchError) throw new Error('Fetch carousel failed: ' + fetchError.message);

  const slides = (carousel.slides ?? []) as any[];
  if (slides[slide_index]) slides[slide_index].imageUrl = publicUrl;

  const patch: Record<string, unknown> = { slides };
  if (slide_index === 0) patch.cover_image_url = publicUrl;

  const { error: updateError } = await supabase
    .from('carousels')
    .update(patch)
    .eq('id', carousel_id);

  if (updateError) throw new Error('Update carousel failed: ' + updateError.message);

  return { publicUrl, slide_index, carousel_id, locale };
}
