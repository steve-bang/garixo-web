type FAQItem = {
  question: string;
  answer: string;
};

const faqs: FAQItem[] = [
  {
    question: 'What is garage management software?',
    answer:
      'Garage management software is a digital platform that helps auto repair shop owners manage vehicles, jobs, technicians, parts inventory, and daily financial performance in one system. It replaces scattered spreadsheets and manual tracking with a clear operational workflow.'
  },
  {
    question: 'How does garage management software increase profit?',
    answer:
      'Garage management software increases profit by improving job tracking, reducing parts leakage, and giving real-time visibility into labor and revenue. With a structured auto shop management system, owners can identify delays, control costs, and make faster business decisions.'
  },
  {
    question: 'Is this suitable for small auto repair shops?',
    answer:
      'Yes. This auto repair shop management software is designed for small and growing workshops that need a simple operational system. Teams can start with core workflows, then scale usage as the business grows.'
  },
  {
    question: 'Can it be used globally?',
    answer:
      'Yes. Garixo is a web-based workshop management software that can be used globally. Owners and teams can access the automotive repair management software from any location with internet access.'
  }
];

export function StructuredData(): JSX.Element {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
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
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description: 'garage management software for auto repair shops'
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Garixo',
    url: 'https://garixo.com'
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
    </>
  );
}
