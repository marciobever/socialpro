import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Providers } from './providers';
import { routing } from '@/i18n/routing';
import '../globals.css';

const font = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

const BASE_URL = 'https://socialproai.com';

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string }> }
): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });
  const title       = t('title');
  const description = t('description');

  return {
    metadataBase: new URL(BASE_URL),
    title: {
      default: title,
      template: `%s | SocialPro`,
    },
    description,
    keywords: [
      'carrossel instagram ia', 'criar carrossel instagram', 'social media ia',
      'gerador de carrossel', 'conteúdo instagram ia', 'social pro',
      'instagram carousel ai', 'ai social media tool', 'content creator ai',
    ],
    authors: [{ name: 'SocialPro AI', url: BASE_URL }],
    creator: 'SocialPro AI',
    publisher: 'SocialPro AI Inc.',
    robots: {
      index: true, follow: true,
      googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
    openGraph: {
      type: 'website',
      locale: locale === 'pt' ? 'pt_BR' : locale === 'es' ? 'es_ES' : 'en_US',
      url: BASE_URL,
      siteName: 'SocialPro',
      title,
      description,
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'SocialPro — Carrosséis para Instagram com IA' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image.png'],
      creator: '@socialproai',
    },
    alternates: {
      canonical: BASE_URL,
      languages: { 'pt-BR': `${BASE_URL}/pt`, 'en': `${BASE_URL}/en`, 'es': `${BASE_URL}/es` },
    },
    manifest: '/site.webmanifest',
    category: 'technology',
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!(routing.locales as readonly string[]).includes(locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} className={`${font.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-dark-bg text-dark-text relative">
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('sp-theme')||'dark';document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`,
          }}
        />
        <NextIntlClientProvider messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
