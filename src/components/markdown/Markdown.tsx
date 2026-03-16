import type { ReactNode } from 'react';

import { slugify } from '@/features/blogs/utils';

import { compileMdx } from '@/lib/mdx';

type MarkdownProps = {
  source: string;
  withAnchors?: boolean;
};

type CodeElement = {
  props?: {
    className?: string;
    children?: string;
  };
};

function extractText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(extractText).join('');
  }

  if (node && typeof node === 'object' && 'props' in node) {
    return extractText(
      (node as { props?: { children?: ReactNode } }).props?.children
    );
  }

  return '';
}

function createHeadingIdFactory() {
  const counts = new Map<string, number>();

  return (value: string): string => {
    const base = slugify(value);
    if (!base) {
      return '';
    }

    const nextCount = (counts.get(base) ?? 0) + 1;
    counts.set(base, nextCount);

    return nextCount > 1 ? `${base}-${nextCount}` : base;
  };
}

export async function Markdown({
  source,
  withAnchors
}: MarkdownProps): Promise<JSX.Element> {
  const createHeadingId = withAnchors ? createHeadingIdFactory() : null;

  const withHeadingAnchor = (
    Tag: 'h2' | 'h3',
    props: { children?: ReactNode; [key: string]: unknown }
  ) => {
    const text = extractText(props.children ?? '');
    const id = createHeadingId ? createHeadingId(text) : '';
    return (
      <Tag id={id || undefined} {...props}>
        {props.children as ReactNode}
      </Tag>
    );
  };

  const content = await compileMdx(source, {
    components: {
      h2: (props: { children?: ReactNode }) => withHeadingAnchor('h2', props),
      h3: (props: { children?: ReactNode }) => withHeadingAnchor('h3', props),
      pre: ({
        children,
        ...props
      }: {
        children?: CodeElement;
        [key: string]: unknown;
      }) => {
        return <pre {...props}>{children as ReactNode}</pre>;
      }
    }
  });

  return <article className="prose-ui">{content}</article>;
}
