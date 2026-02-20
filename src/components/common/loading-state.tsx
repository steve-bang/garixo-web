import { Loader2 } from 'lucide-react';

type LoadingStateProps = {
  label?: string;
  fullPage?: boolean;
};

export function LoadingState({ label = 'Loading...', fullPage = false }: LoadingStateProps): JSX.Element {
  return (
    <div className={fullPage ? 'grid min-h-screen place-items-center' : 'grid min-h-[200px] place-items-center'}>
      <div className="flex items-center gap-s2 text-small text-text-muted">
        <Loader2 className="size-4 animate-spin" />
        <span>{label}</span>
      </div>
    </div>
  );
}
