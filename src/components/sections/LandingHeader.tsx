import Link from 'next/link';
import Image from 'next/image';

import { Button } from '@/components/ui/button';

export function LandingHeader(): JSX.Element {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface-default/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between px-s4">
        <Link href="/" className="flex items-center" aria-label="Garixo Home">
          <span className="grid size-10 place-items-center overflow-hidden rounded-md">
            <Image
              src="/favicon/favicon.svg"
              alt="Garixo logo"
              width={30}
              height={30}
              className="size-7"
            />
          </span>
          <span className="text-h3">Garixo</span>
        </Link>

        <nav
          className="hidden items-center gap-s6 md:flex"
          aria-label="Primary"
        >
          <Link
            href="/features"
            className="text-small text-text-secondary hover:text-text-primary"
          >
            Features
          </Link>
          <Link
            href="/blog"
            className="text-small text-text-secondary hover:text-text-primary"
          >
            Blog
          </Link>
          <Link
            href="/case-studies"
            className="text-small text-text-secondary hover:text-text-primary"
          >
            Case Studies
          </Link>
          <Link
            href="/pricing"
            className="text-small text-text-secondary hover:text-text-primary"
          >
            Pricing
          </Link>
        </nav>

        <div className="flex items-center gap-s2">
          <Button
            asChild
            variant="ghost"
            className="hidden h-10 md:inline-flex"
          >
            <Link href="/auth/login">Sign In</Link>
          </Button>
          <Button asChild className="h-10">
            <Link href="/auth/sign-up">Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
