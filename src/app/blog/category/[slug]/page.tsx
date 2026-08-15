import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import {
  listBlogCategories,
  listPublishedBlogs
} from '@/app/api/blogs/blogs-db';
import { LandingFooter } from '@/components/sections/LandingFooter';
import { LandingHeader } from '@/components/sections/LandingHeader';
import { BlogIndex } from '@/features/blogs/components/blog-index';
import { slugMatches } from '@/features/blogs/utils';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const categories = await listBlogCategories();
  const category = categories.find((item) => item.slug === slug);

  if (!category) {
    return {
      title: 'Category Not Found | Garixo'
    };
  }

  const title = `${category.name} Articles | Garixo Blog`;
  const description = `Practical ${category.name.toLowerCase()} guides for independent auto repair shop owners, from the Garixo blog.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/blog/category/${category.slug}`
    },
    robots: {
      index: true,
      follow: true
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://www.garixo.com/blog/category/${category.slug}`
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description
    }
  };
}

export default async function BlogCategoryPage({
  params
}: Props): Promise<JSX.Element> {
  const { slug } = await params;
  const [categories, allPosts] = await Promise.all([
    listBlogCategories(),
    listPublishedBlogs()
  ]);

  const category = categories.find((item) => item.slug === slug);

  if (!category) {
    notFound();
  }

  const posts = allPosts.filter((post) => slugMatches(post.category, slug));

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${category.name} Articles | Garixo Blog`,
    url: `https://www.garixo.com/blog/category/${category.slug}`,
    description: `Practical ${category.name.toLowerCase()} guides for independent auto repair shop owners.`
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.garixo.com/'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: 'https://www.garixo.com/blog'
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: category.name,
        item: `https://www.garixo.com/blog/category/${category.slug}`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <LandingHeader />
      <main>
        <section className="border-b border-border bg-background-primary py-s12">
          <div className="mx-auto w-full max-w-[980px] space-y-s4 px-s4 text-center">
            <p className="inline-flex items-center rounded-full border border-primary-100 bg-primary-50 px-s3 py-s1 text-caption font-semibold text-primary-700">
              Garixo Blog
            </p>
            <h1 className="text-[34px] font-bold leading-tight text-text-primary md:text-[48px]">
              {category.name} Articles
            </h1>
            <p className="mx-auto mt-s3 max-w-[700px] text-body text-text-secondary">
              Practical {category.name.toLowerCase()} guides for independent
              garage owners.
            </p>
          </div>
        </section>

        <section className="bg-background-primary py-s10">
          <BlogIndex
            posts={posts}
            categories={categories}
            activeCategorySlug={category.slug}
          />
        </section>
      </main>
      <LandingFooter />
    </>
  );
}
