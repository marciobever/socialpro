// Gera a logo do SocialPro 1024x1024 usando gpt-image-2
// Uso: node generate-logo.mjs
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Lê o .env.local manualmente
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const apiKey = envContent.match(/^OPENAI_API_KEY=(.+)$/m)?.[1]?.trim();

if (!apiKey) { console.error('OPENAI_API_KEY não encontrada no .env.local'); process.exit(1); }

const openai = new OpenAI({ apiKey });

const prompt = `
A minimalist, modern app logo for "SocialPro" on a deep dark background (#07080c).
Center: a stylized brain circuit icon, geometric and clean, glowing with a gradient from electric purple (#8b5cf6) to cyan (#06b6d4).
Below the icon: the word "SocialPro" in bold modern sans-serif font — "Social" in clean white, "Pro" in the same purple-to-cyan gradient.
The overall look is a premium dark-mode tech SaaS brand — similar to Linear, Vercel, or Supabase aesthetics.
No busy background, no extra text, no slogans. Just the icon + wordmark centered on a very dark solid background.
Square format, centered, plenty of breathing room around the elements.
`.trim();

console.log('Gerando logo com gpt-image-2...');

const response = await openai.images.generate({
  model: 'gpt-image-2',
  prompt,
  n: 1,
  size: '1024x1024',
  quality: 'high',
});

const imageData = response.data[0];
let buffer;

if (imageData.b64_json) {
  buffer = Buffer.from(imageData.b64_json, 'base64');
} else if (imageData.url) {
  const imgRes = await fetch(imageData.url);
  buffer = Buffer.from(await imgRes.arrayBuffer());
} else {
  console.error('Sem dados de imagem na resposta'); process.exit(1);
}

const outPath = path.join(__dirname, 'socialpro-logo-1024.png');
fs.writeFileSync(outPath, buffer);

console.log(`✅ Logo salva em: ${outPath}`);
