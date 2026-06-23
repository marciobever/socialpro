import type { MetadataRoute } from 'next';

const base = 'https://socialproai.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: base,                          lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${base}/pricing`,             lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/login`,               lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/privacy`,             lastModified: now, changeFrequency: 'yearly',  priority: 0.4 },
    { url: `${base}/terms`,               lastModified: now, changeFrequency: 'yearly',  priority: 0.4 },
    { url: `${base}/data-deletion`,       lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    // PT locales
    { url: `${base}/pt`,                  lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${base}/pt/pricing`,          lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/pt/login`,            lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    // EN locales
    { url: `${base}/en`,                  lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${base}/en/pricing`,          lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    // ES locales
    { url: `${base}/es`,                  lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${base}/es/pricing`,          lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
  ];
}
