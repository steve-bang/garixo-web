import type { MetadataRoute } from 'next';

function getBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://www.garixo.com';
  return raw.endsWith('/') ? raw.slice(0, -1) : raw;
}

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/admin/', '/private/', '/auth/']
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`
  };
}
