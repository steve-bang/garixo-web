'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';

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
          <div className="group relative">
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-small text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
              aria-haspopup="true"
            >
              Product
              <ChevronDown className="size-4 transition-transform duration-200 group-hover:rotate-180" />
            </button>

            <div className="pointer-events-none absolute left-0 top-full z-20 w-[220px] translate-y-2 pt-3 opacity-0 transition duration-200 ease-out group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
              <div className="rounded-xl border border-border bg-surface-default p-s2 shadow-xl">
                <div className="px-s3 pb-s2 pt-s1">
                  <p className="text-caption font-semibold uppercase tracking-wide text-text-muted">
                    Product
                  </p>
                </div>

                <div className="grid gap-s2 px-s1 pb-s1 pt-s1">
                  <Link
                    href="/features"
                    className="block rounded-lg px-s3 py-s2 transition-colors hover:bg-surface-hover"
                  >
                    <p className="text-small font-medium text-text-primary">
                      Features
                    </p>
                    <p className="mt-1 text-caption text-text-muted">
                      Explore product capabilities
                    </p>
                  </Link>
                  <Link
                    href="/pricing"
                    className="block rounded-lg px-s3 py-s2 transition-colors hover:bg-surface-hover"
                  >
                    <p className="text-small font-medium text-text-primary">
                      Pricing
                    </p>
                    <p className="mt-1 text-caption text-text-muted">
                      See plans and trials
                    </p>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="group relative">
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-small text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
              aria-haspopup="true"
            >
              Solutions
              <ChevronDown className="size-4 transition-transform duration-200 group-hover:rotate-180" />
            </button>

            <div className="pointer-events-none absolute left-0 top-full z-20 w-[320px] translate-y-2 pt-3 opacity-0 transition duration-200 ease-out group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
              <div className="rounded-xl border border-border bg-surface-default p-s2 shadow-xl">
                <div className="px-s3 pb-s2 pt-s1">
                  <p className="text-caption font-semibold uppercase tracking-wide text-text-muted">
                    Solutions
                  </p>
                  <p className="text-caption text-text-muted">
                    Pick your shop type
                  </p>
                </div>

                <div className="grid gap-s2 px-s1 pb-s1 pt-s1">
                  <Link
                    href="/solutions/garage-management-software-for-tire-shops"
                    className="block rounded-lg px-s3 py-s2 transition-colors hover:bg-surface-hover"
                  >
                    <p className="text-small font-medium text-text-primary">
                      Tire Shops
                    </p>
                    <p className="mt-1 text-caption text-text-muted">
                      Fast work orders, tire inventory, and simple invoicing.
                    </p>
                  </Link>

                  <Link
                    href="/solutions/garage-management-software-for-auto-body-shops"
                    className="block rounded-lg px-s3 py-s2 transition-colors hover:bg-surface-hover"
                  >
                    <p className="text-small font-medium text-text-primary">
                      Auto Body Shops
                    </p>
                    <p className="mt-1 text-caption text-text-muted">
                      Repair workflows, parts tracking, and clean invoices.
                    </p>
                  </Link>

                  <Link
                    href="/solutions/garage-management-software-for-mobile-mechanics"
                    className="block rounded-lg px-s3 py-s2 transition-colors hover:bg-surface-hover"
                  >
                    <p className="text-small font-medium text-text-primary">
                      Mobile Mechanics
                    </p>
                    <p className="mt-1 text-caption text-text-muted">
                      On-the-go work orders, parts, and fast invoicing.
                    </p>
                  </Link>

                  <Link
                    href="/solutions/garage-management-software-for-dealerships"
                    className="block rounded-lg px-s3 py-s2 transition-colors hover:bg-surface-hover"
                  >
                    <p className="text-small font-medium text-text-primary">
                      Dealerships
                    </p>
                    <p className="mt-1 text-caption text-text-muted">
                      Service work orders, parts usage, and faster billing.
                    </p>
                  </Link>
                </div>
              </div>
            </div>
          </div>

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

          <div className="group relative">
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-small text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
              aria-haspopup="true"
            >
              Resources
              <ChevronDown className="size-4 transition-transform duration-200 group-hover:rotate-180" />
            </button>

            <div className="pointer-events-none absolute left-0 top-full z-20 w-[280px] translate-y-2 pt-3 opacity-0 transition duration-200 ease-out group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
              <div className="rounded-xl border border-border bg-surface-default p-s2 shadow-xl">
                <div className="grid gap-s2 px-s1 pb-s1 pt-s1">
                  <Link
                    href="/tools/auto-repair-labor-rate-calculator"
                    className="block rounded-lg px-s3 py-s2 transition-colors hover:bg-surface-hover"
                  >
                    <p className="text-small font-medium text-text-primary">
                      Labor Rate Calculator
                    </p>
                    <p className="mt-1 text-caption text-text-muted">
                      Find your break-even and recommended hourly rate.
                    </p>
                  </Link>
                  <Link
                    href="/tools/auto-repair-shop-profit-calculator"
                    className="block rounded-lg px-s3 py-s2 transition-colors hover:bg-surface-hover"
                  >
                    <p className="text-small font-medium text-text-primary">
                      Shop Profit Calculator
                    </p>
                    <p className="mt-1 text-caption text-text-muted">
                      Estimate monthly profit and margin in minutes.
                    </p>
                  </Link>
                </div>
              </div>
            </div>
          </div>
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
              href="/solutions/garage-management-software-for-tire-shops"
              className="block rounded-md px-s3 py-s2 text-small text-text-secondary hover:bg-surface-hover hover:text-text-primary"
              onClick={closeMobileMenu}
            >
              Solutions
            </Link>
            <div className="space-y-s1 pl-s2">
              <Link
                href="/solutions/garage-management-software-for-tire-shops"
                className="block rounded-md px-s3 py-s2 text-small text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                onClick={closeMobileMenu}
              >
                Tire Shops
              </Link>
              <Link
                href="/solutions/garage-management-software-for-auto-body-shops"
                className="block rounded-md px-s3 py-s2 text-small text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                onClick={closeMobileMenu}
              >
                Auto Body Shops
              </Link>
              <Link
                href="/solutions/garage-management-software-for-mobile-mechanics"
                className="block rounded-md px-s3 py-s2 text-small text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                onClick={closeMobileMenu}
              >
                Mobile Mechanics
              </Link>
              <Link
                href="/solutions/garage-management-software-for-dealerships"
                className="block rounded-md px-s3 py-s2 text-small text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                onClick={closeMobileMenu}
              >
                Dealerships
              </Link>
            </div>
            <Link
              href="/features"
              className="block rounded-md px-s3 py-s2 text-small text-text-secondary hover:bg-surface-hover hover:text-text-primary"
              onClick={closeMobileMenu}
            >
              Product
            </Link>
            <div className="space-y-s1 pl-s2">
              <Link
                href="/features"
                className="block rounded-md px-s3 py-s2 text-small text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                onClick={closeMobileMenu}
              >
                Features
              </Link>
              <Link
                href="/pricing"
                className="block rounded-md px-s3 py-s2 text-small text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                onClick={closeMobileMenu}
              >
                Pricing
              </Link>
            </div>
            <Link
              href="/blog"
              className="block rounded-md px-s3 py-s2 text-small text-text-secondary hover:bg-surface-hover hover:text-text-primary"
              onClick={closeMobileMenu}
            >
              Blog
            </Link>
            <Link
              href="/tools/auto-repair-labor-rate-calculator"
              className="block rounded-md px-s3 py-s2 text-small text-text-secondary hover:bg-surface-hover hover:text-text-primary"
              onClick={closeMobileMenu}
            >
              Labor Rate Calculator
            </Link>
            <Link
              href="/tools/auto-repair-shop-profit-calculator"
              className="block rounded-md px-s3 py-s2 text-small text-text-secondary hover:bg-surface-hover hover:text-text-primary"
              onClick={closeMobileMenu}
            >
              Shop Profit Calculator
            </Link>
            <Link
              href="/case-studies"
              className="block rounded-md px-s3 py-s2 text-small text-text-secondary hover:bg-surface-hover hover:text-text-primary"
              onClick={closeMobileMenu}
            >
              Case Studies
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
