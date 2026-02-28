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
      extraPlugins: [withUploadAdapter]
    }),
    [placeholder]
  );

  const minEditorHeight = Math.max(10, rows) * 24;

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
        data={value || '<p></p>'}
        config={config}
        onChange={(_event, editor) => {
          onChange(editor.getData());
        }}
      />
    </Card>
  );
}
