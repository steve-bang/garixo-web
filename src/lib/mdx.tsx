import type { ReactNode } from 'react';

import { markdownToHtml, sanitizeRichHtml } from '@/features/blogs/utils';

type CompileMdxOptions = {
  components?: Record<string, unknown>;
};

/**
 * Compile markdown/MDX content to React nodes on the server.
 *
 * Security:
 * - We run rehype-sanitize in the MDX pipeline.
 * - If MDX runtime modules are unavailable, we fallback to sanitized HTML rendering.
 */
export async function compileMdx(
  source: string,
  options?: CompileMdxOptions
): Promise<ReactNode> {
  try {
    const nextMdxModule = 'next-mdx-remote/rsc';
    const remarkGfmModule = 'remark-gfm';
    const rehypeRawModule = 'rehype-raw';
    const rehypeSanitizeModule = 'rehype-sanitize';

    const [{ compileMDX }, remarkGfm, rehypeRaw, rehypeSanitize] =
      (await Promise.all([
        import(nextMdxModule),
        import(remarkGfmModule),
        import(rehypeRawModule),
        import(rehypeSanitizeModule)
      ])) as any;

    const defaultSchema = rehypeSanitize.defaultSchema ?? {};
    const defaultAttributes = defaultSchema.attributes ?? {};

    const schema = {
      ...defaultSchema,
      attributes: {
        ...defaultAttributes,
        '*': [...(defaultAttributes['*'] ?? []), 'className', 'class', 'id'],
        a: [
          ...(defaultAttributes.a ?? []),
          'target',
          'rel',
          'className',
          'class'
        ]
      }
    };

    const result = await compileMDX({
      source,
      components: options?.components,
      options: {
        mdxOptions: {
          remarkPlugins: [remarkGfm.default ?? remarkGfm],
          rehypePlugins: [
            rehypeRaw.default ?? rehypeRaw,
            [rehypeSanitize.default ?? rehypeSanitize, schema]
          ]
        }
      }
    });

    return result.content;
  } catch {
    const safeHtml = sanitizeRichHtml(markdownToHtml(source));
    return <div dangerouslySetInnerHTML={{ __html: safeHtml }} />;
  }
}
