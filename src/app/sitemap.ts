import type { MetadataRoute } from 'next';

import { caseStudies } from '@/lib/caseStudies';

function getBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://www.garixo.com';
  return raw.endsWith('/') ? raw.slice(0, -1) : raw;
}

function toAbsoluteUrl(baseUrl: string, path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: toAbsoluteUrl(baseUrl, '/'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0
    },
    {
      url: toAbsoluteUrl(baseUrl, '/features'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9
    },
    {
      url: toAbsoluteUrl(baseUrl, '/pricing'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9
    },
    {
      url: toAbsoluteUrl(baseUrl, '/book-demo'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7
    },
    {
      url: toAbsoluteUrl(baseUrl, '/case-studies'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8
    },
    {
      url: toAbsoluteUrl(baseUrl, '/blog'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8
    }
  ];

  const caseStudyPages: MetadataRoute.Sitemap = caseStudies.map((study) => ({
    url: toAbsoluteUrl(baseUrl, `/case-studies/${study.slug}`),
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7
  }));

  return [...staticPages, ...caseStudyPages];
}
