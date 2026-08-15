export function WebsiteStructuredData(): JSX.Element {
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Garixo',
    url: 'https://www.garixo.com',
    description:
      'Garixo is an all-in-one garage management software platform for independent auto repair shops.'
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
    />
  );
}
