import Link from 'next/link';

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { GarageInformationForm } from '@/features/settings/components/garage-information-form';
import type { SettingsNavItem, SettingsSection } from '@/features/settings/types';
import { cn } from '@/lib/utils/cn';

type SettingsModuleProps = {
  activeSectionKey: SettingsSection['key'];
  navItems: SettingsNavItem[];
  section: SettingsSection;
};

export function SettingsModule({ activeSectionKey, navItems, section }: SettingsModuleProps): JSX.Element {
  return (
    <div className="space-y-s4">
      <h1 className="text-h1">Settings</h1>

      <section className="grid grid-cols-1 gap-s4 md:grid-cols-[240px_1fr]">
        <aside className="rounded-lg border border-border bg-surface-default p-s2 shadow-xs">
          <nav className="space-y-s1" aria-label="Settings sections">
            {navItems.map((item) => {
              const isActive = item.key === activeSectionKey;

              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={cn(
                    'relative flex min-h-[44px] items-center rounded-md px-s3 py-s2 text-small text-text-secondary transition-colors',
                    isActive
                      ? 'bg-primary-50 text-primary-800 dark:bg-primary-900/30 dark:text-primary-200'
                      : 'hover:bg-surface-hover hover:text-text-primary'
                  )}
                >
                  {isActive ? <span className="absolute inset-y-1 left-0 w-[3px] rounded-r-full bg-primary-600" aria-hidden /> : null}
                  <span className="pl-s2">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {section.key === 'garage-information' ? (
          <GarageInformationForm />
        ) : (
          <div className="mx-auto max-w-[820px] space-y-s4">
            <header className="space-y-s1">
              <h2 className="text-h2">{section.title}</h2>
              <p className="text-small text-text-muted">{section.description}</p>
            </header>

            <div className="space-y-s4">
              {section.cards.map((card) => (
                <Card key={card.title} className="p-s4">
                  <div className="mb-s4">
                    <h3 className="text-h3">{card.title}</h3>
                    <p className="text-small text-text-muted">{card.description}</p>
                  </div>

                  <div className="grid gap-s3 md:grid-cols-2">
                    {card.fields.map((field) => (
                      <div key={field.label} className="space-y-s1">
                        <label className="text-small font-medium text-text-secondary">{field.label}</label>
                        <Input defaultValue={field.value} aria-label={field.label} />
                        {field.helperText ? <p className="text-caption text-text-muted">{field.helperText}</p> : null}
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
