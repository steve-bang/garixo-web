'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

import { Button } from '@/components/ui/button';

export function LandingHeader(): JSX.Element {
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobileMenu = () => setMobileOpen(false);

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
            type="button"
            variant="ghost"
            className="h-12 w-12 p-0 md:hidden"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-controls="landing-mobile-nav"
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            {mobileOpen ? (
              <X className="size-6" />
            ) : (
              <Menu className="size-6" />
            )}
          </Button>
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

      {mobileOpen ? (
        <div
          id="landing-mobile-nav"
          className="border-t border-border bg-surface-default md:hidden"
        >
          <nav
            className="mx-auto w-full max-w-[1200px] space-y-s2 px-s4 py-s4"
            aria-label="Mobile Primary"
          >
            <Link
              href="/features"
              className="block rounded-md px-s3 py-s2 text-small text-text-secondary hover:bg-surface-hover hover:text-text-primary"
              onClick={closeMobileMenu}
            >
              Features
            </Link>
            <Link
              href="/blog"
              className="block rounded-md px-s3 py-s2 text-small text-text-secondary hover:bg-surface-hover hover:text-text-primary"
              onClick={closeMobileMenu}
            >
              Blog
            </Link>
            <Link
              href="/case-studies"
              className="block rounded-md px-s3 py-s2 text-small text-text-secondary hover:bg-surface-hover hover:text-text-primary"
              onClick={closeMobileMenu}
            >
              Case Studies
            </Link>
            <Link
              href="/pricing"
              className="block rounded-md px-s3 py-s2 text-small text-text-secondary hover:bg-surface-hover hover:text-text-primary"
              onClick={closeMobileMenu}
            >
              Pricing
            </Link>
            <div className="grid grid-cols-2 gap-s2 pt-s2">
              <Button asChild variant="ghost" className="h-10">
                <Link href="/auth/login" onClick={closeMobileMenu}>
                  Sign In
                </Link>
              </Button>
              <Button asChild className="h-10">
                <Link href="/auth/sign-up" onClick={closeMobileMenu}>
                  Get Started
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
