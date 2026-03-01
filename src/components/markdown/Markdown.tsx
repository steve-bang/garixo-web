import type { ReactNode } from 'react';

import { compileMdx } from '@/lib/mdx';

type MarkdownProps = {
  source: string;
};

type CodeElement = {
  props?: {
    className?: string;
    children?: string;
  };
};

export async function Markdown({
  source
}: MarkdownProps): Promise<JSX.Element> {
  const content = await compileMdx(source, {
    components: {
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
