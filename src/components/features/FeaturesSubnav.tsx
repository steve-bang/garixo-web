'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { MouseEvent } from 'react';

const navItems = [
  { label: 'Work Orders', href: '#work-order' },
  { label: 'Customers', href: '#customers' },
  { label: 'Inventory', href: '#inventory' },
  { label: 'Staff', href: '#staff' },
  { label: 'FAQ', href: '#faq' }
] as const;

export function FeaturesSubnav(): JSX.Element {
  const [activeSection, setActiveSection] = useState<string>('work-order');

  const handleNavClick = (
    event: MouseEvent<HTMLAnchorElement>,
    id: string
  ): void => {
    event.preventDefault();
    const section = document.getElementById(id);
    if (!section) {
      return;
    }

    setActiveSection(id);

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    section.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start'
    });
    window.history.replaceState(null, '', `#${id}`);
  };

  useEffect(() => {
    const sectionIds = navItems.map((item) => item.href.replace('#', ''));
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));

    const setFromHash = (): void => {
      const hashId = window.location.hash.replace('#', '');
      if (sectionIds.includes(hashId)) {
        setActiveSection(hashId);
      }
    };

    setFromHash();
    window.addEventListener('hashchange', setFromHash);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target?.id) {
          setActiveSection(visible.target.id);
        }
      },
      {
        rootMargin: '-25% 0px -60% 0px',
        threshold: [0.2, 0.4, 0.6]
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      window.removeEventListener('hashchange', setFromHash);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="sticky top-16 z-30 border-b border-border bg-surface-default/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1200px] items-center gap-s6 overflow-x-auto px-s4">
        {navItems.map((item) => (
          // Keep active section visually clear for fast scan while browsing long feature pages.
          <Link
            key={item.label}
            href={item.href}
            onClick={(event) =>
              handleNavClick(event, item.href.replace('#', ''))
            }
            className={`whitespace-nowrap border-b-2 py-s3 text-caption font-semibold transition-colors ${
              activeSection === item.href.replace('#', '')
                ? 'border-primary-700 text-primary-700'
                : 'border-transparent text-text-muted hover:border-primary-300 hover:text-primary-700'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
