'use client';

import { useEffect, useMemo, useState, type ComponentType } from 'react';

import { Card } from '@/components/ui/card';

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
};

type CKEditorComponentProps = {
  editor: unknown;
  data: string;
  config?: Record<string, unknown>;
  onReady?: (editor: unknown) => void;
  onChange: (_event: unknown, editor: { getData: () => string }) => void;
};

type CKEditorModule = {
  CKEditor: ComponentType<CKEditorComponentProps>;
};

type ClassicEditorModule = {
  default: unknown;
};

type UploadApiResponse = {
  success: boolean;
  data?: {
    url: string;
  };
  error?: string;
};

type LoaderLike = {
  file: Promise<File>;
};

class FirebaseStorageUploadAdapter {
  private loader: LoaderLike;

  private abortController: AbortController | null = null;

  constructor(loader: LoaderLike) {
    this.loader = loader;
  }

  async upload(): Promise<{ default: string }> {
    const file = await this.loader.file;
    const formData = new FormData();
    formData.append('file', file);

    this.abortController = new AbortController();

    const response = await fetch('/api/blogs/upload-image', {
      method: 'POST',
      body: formData,
      signal: this.abortController.signal
    });

    const payload = (await response.json()) as UploadApiResponse;

    if (!response.ok || !payload.success || !payload.data?.url) {
      throw new Error(payload.error ?? 'Image upload failed.');
    }

    return {
      default: payload.data.url
    };
  }

  abort(): void {
    this.abortController?.abort();
  }
}

function withUploadAdapter(editor: any): void {
  const fileRepository = editor.plugins.get('FileRepository');

  fileRepository.createUploadAdapter = (loader: LoaderLike) =>
    new FirebaseStorageUploadAdapter(loader);
}

function decodeHtmlEntities(input: string): string {
  if (!input) {
    return input;
  }

  if (
    !input.includes('&lt;') &&
    !input.includes('&gt;') &&
    !input.includes('&amp;')
  ) {
    return input;
  }

  const textarea = document.createElement('textarea');
  textarea.innerHTML = input;
  return textarea.value;
}

function looksLikeHtmlSnippet(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) {
    return false;
  }

  return /<([a-z][^/\s>]*)\b[^>]*>([\s\S]*?)<\/\1>|<([a-z][^/\s>]*)\b[^>]*\/?>/i.test(
    trimmed
  );
}

function looksLikeEncodedHtmlSnippet(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) {
    return false;
  }

  return /&lt;[a-z][\s\S]*?&gt;/i.test(trimmed);
}

function withRawHtmlPasteSupport(editor: any): void {
  const viewDocument = editor.editing.view.document;

  // If pasted payload only exposes text/plain but looks like HTML,
  // promote it to text/html so CKEditor's native clipboard pipeline
  // handles it as real HTML (including class/attribute processing).
  viewDocument.on(
    'clipboardInput',
    (_event: unknown, data: any): void => {
      const html = data?.dataTransfer?.getData?.('text/html');
      if (typeof html === 'string' && html.trim()) {
        return;
      }

      const text = data?.dataTransfer?.getData?.('text/plain');
      if (typeof text !== 'string') {
        return;
      }

      const normalizedText = looksLikeEncodedHtmlSnippet(text)
        ? decodeHtmlEntities(text)
        : text;

      if (!looksLikeHtmlSnippet(normalizedText)) {
        return;
      }

      data.dataTransfer.setData('text/html', normalizedText);
    },
    { priority: 'high' }
  );
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write your content here...',
  rows = 5
}: RichTextEditorProps): JSX.Element {
  const [CKEditor, setCKEditor] =
    useState<ComponentType<CKEditorComponentProps> | null>(null);
  const [editorClass, setEditorClass] = useState<unknown>(null);

  useEffect(() => {
    let active = true;

    async function loadEditor() {
      const [ckeditorReact, classicEditor] = await Promise.all([
        import('@ckeditor/ckeditor5-react') as Promise<CKEditorModule>,
        import('@ckeditor/ckeditor5-build-classic') as Promise<ClassicEditorModule>
      ]);

      if (!active) {
        return;
      }

      setCKEditor(() => ckeditorReact.CKEditor);
      setEditorClass(() => classicEditor.default);
    }

    loadEditor().catch(() => {
      setCKEditor(null);
      setEditorClass(null);
    });

    return () => {
      active = false;
    };
  }, []);

  const config = useMemo(
    () => ({
      placeholder,
      toolbar: [
        'sourceEditing',
        '|',
        'heading',
        '|',
        'bold',
        'italic',
        'link',
        'bulletedList',
        'numberedList',
        '|',
        'insertTable',
        'imageUpload',
        'blockQuote',
        'undo',
        'redo'
      ],
      image: {
        toolbar: [
          'imageTextAlternative',
          'imageStyle:inline',
          'imageStyle:block',
          'imageStyle:side'
        ]
      },
      table: {
        contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells']
      },
      /**
       * General HTML Support:
       * - Allows preserving custom/unknown HTML nodes and attributes while editing.
       * - This keeps user-provided HTML structure from being stripped by the editor model.
       *
       * Security note:
       * - This setting preserves HTML in the editor output; it does not sanitize unsafe input.
       * - Always sanitize HTML again on the server before persistence/rendering to avoid XSS.
       */
      htmlSupport: {
        allow: [
          {
            name: /.*/,
            attributes: true,
            classes: true,
            styles: true
          }
        ]
      },
      extraPlugins: [withUploadAdapter]
    }),
    [placeholder]
  );

  const minEditorHeight = Math.max(10, rows) * 24;
  const editorData = decodeHtmlEntities(value || '<p></p>');

  if (!CKEditor || !editorClass) {
    return (
      <Card className="p-s4">
        <div
          className="rounded-md border border-input-border bg-input px-s4 py-s3 text-small text-text-muted"
          style={{ minHeight: `${minEditorHeight}px` }}
        >
          Loading editor...
        </div>
      </Card>
    );
  }

  return (
    <Card className="space-y-s3 p-s4">
      <style jsx>{`
        :global(.ck-editor__editable_inline) {
          min-height: ${minEditorHeight}px;
        }
      `}</style>
      <CKEditor
        editor={editorClass}
        data={editorData}
        config={config}
        onReady={(editor) => {
          const readyEditor = editor as any;
          withRawHtmlPasteSupport(readyEditor);
        }}
        onChange={(_event, editor) => {
          const html = decodeHtmlEntities(editor.getData());
          onChange(html);
        }}
      />
    </Card>
  );
}
