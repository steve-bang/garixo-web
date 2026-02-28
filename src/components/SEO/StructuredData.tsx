import { landingFaqs } from '@/components/sections/landing-data';

export function StructuredData(): JSX.Element {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: landingFaqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };

  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Garixo',
    url: 'https://www.garixo.com',
    logo: 'https://www.garixo.com/favicon/favicon.svg',
    applicationCategory: 'BusinessApplication',
    applicationSubCategory: 'Garage Management Software',
    operatingSystem: 'Web, Any modern browser',
    description:
      'Garixo is an all-in-one garage management software platform for auto repair shops. Track vehicles, manage technicians, control inventory, and monitor daily profit in one simple workspace.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Free to get started. No credit card required.',
      url: 'https://www.garixo.com/pricing'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '98',
      bestRating: '5',
      worstRating: '1'
    },
    featureList: [
      'Vehicle check-in and pickup tracking',
      'Technician job assignment and productivity tracking',
      'Inventory management with auto parts deduction',
      'Real-time financial dashboard',
      'Daily revenue and profit overview',
      'Multi-location support',
      'Global access via web browser'
    ],
    screenshot: 'https://www.garixo.com/images/world-garage-command.svg',
    provider: {
      '@type': 'Organization',
      name: 'Garixo',
      url: 'https://www.garixo.com'
    }
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Garixo',
    url: 'https://www.garixo.com',
    logo: 'https://www.garixo.com/favicon/favicon.svg',
    description:
      'Garixo provides all-in-one garage management software for auto repair shops worldwide.',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      url: 'https://www.garixo.com/auth/sign-up'
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
    </>
  );
}
