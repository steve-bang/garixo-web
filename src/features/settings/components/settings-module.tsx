import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { GarageInformationForm } from '@/features/settings/components/garage-information-form';
import { ServiceConfigurationForm } from '@/features/settings/components/service-configuration-form';
import type { SettingsSection } from '@/features/settings/types';

type SettingsModuleProps = {
  section: SettingsSection;
};

export function SettingsModule({ section }: SettingsModuleProps): JSX.Element {
  return (
    <div className="space-y-s4">
      <h1 className="text-h1">Settings</h1>

      {section.key === 'garage-information' ? (
        <GarageInformationForm />
      ) : section.key === 'service-configuration' ? (
        <ServiceConfigurationForm />
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
    </div>
  );
}
