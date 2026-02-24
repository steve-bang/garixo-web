import { featureFaqs } from '@/components/features/features-data';

export function FeaturesStructuredData(): JSX.Element {
  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': 'https://garixo.com/#app',
    name: 'Garixo',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: 'https://garixo.com/features',
    description:
      'A complete garage management system for auto repair shops with vehicle workflow, technician management, inventory control and real-time financial reporting.',
    featureList: [
      'Vehicle Workflow Management',
      'Technician Labor Tracking',
      'Inventory Control',
      'Real-Time Financial Dashboard'
    ]
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://garixo.com/'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Features',
        item: 'https://garixo.com/features'
      }
    ]
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: featureFaqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}
