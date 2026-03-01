'use client';

import { useEffect, useState, type ComponentType } from 'react';

import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

type MarkdownEditorProps = {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
};

type MDEditorLikeProps = {
  value?: string;
  onChange?: (value?: string) => void;
  height?: number;
  preview?: 'live' | 'edit' | 'preview';
  textareaProps?: Record<string, unknown>;
};

type MDEditorLikeModule = {
  default: ComponentType<MDEditorLikeProps>;
};

export function MarkdownEditor({
  value,
  onChange,
  rows = 12
}: MarkdownEditorProps): JSX.Element {
  const [EditorComponent, setEditorComponent] =
    useState<ComponentType<MDEditorLikeProps> | null>(null);

  useEffect(() => {
    let active = true;

    async function loadEditor() {
      const moduleName = '@uiw/react-md-editor';
      const markdownModule = (await import(moduleName)) as MDEditorLikeModule;

      if (!active) {
        return;
      }

      setEditorComponent(() => markdownModule.default);
    }

    loadEditor().catch(() => {
      setEditorComponent(null);
    });

    return () => {
      active = false;
    };
  }, []);

  if (!EditorComponent) {
    return (
      <Card className="p-s4">
        <Textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={rows}
          placeholder="Write markdown content here..."
          className="font-mono"
        />
      </Card>
    );
  }

  return (
    <div data-color-mode="light" className="rounded-lg border border-border">
      <EditorComponent
        value={value}
        onChange={(nextValue) => onChange(nextValue ?? '')}
        preview="live"
        height={Math.max(260, rows * 24)}
        textareaProps={{
          placeholder: 'Write markdown content here...'
        }}
      />
    </div>
  );
}
