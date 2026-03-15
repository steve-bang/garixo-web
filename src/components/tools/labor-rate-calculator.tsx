'use client';

import { useEffect, useMemo, useState } from 'react';

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { trackEvent } from '@/lib/analytics/ga';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2
});

const numberFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2
});

type LaborRateInputs = {
  rent: number;
  utilities: number;
  insurance: number;
  adminSalaries: number;
  software: number;
  otherCosts: number;
  technicians: number;
  hoursPerDay: number;
  daysPerMonth: number;
  productivity: number;
  desiredProfit: number;
  currentRate: number | null;
};

const defaultInputs: LaborRateInputs = {
  rent: 2500,
  utilities: 400,
  insurance: 350,
  adminSalaries: 2500,
  software: 200,
  otherCosts: 500,
  technicians: 2,
  hoursPerDay: 8,
  daysPerMonth: 22,
  productivity: 75,
  desiredProfit: 2000,
  currentRate: null
};

function safeNumber(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function LaborRateCalculator(): JSX.Element {
  const [inputs, setInputs] = useState<LaborRateInputs>(defaultInputs);
  const [hasTrackedUsage, setHasTrackedUsage] = useState(false);

  useEffect(() => {
    trackEvent('labor_rate_calculator_view');
  }, []);

  const totals = useMemo(() => {
    const totalExpenses =
      inputs.rent +
      inputs.utilities +
      inputs.insurance +
      inputs.adminSalaries +
      inputs.software +
      inputs.otherCosts;

    const billableHours =
      inputs.technicians *
      inputs.hoursPerDay *
      inputs.daysPerMonth *
      (inputs.productivity / 100);

    const breakEvenRate = billableHours > 0 ? totalExpenses / billableHours : 0;
    const recommendedRate =
      billableHours > 0
        ? (totalExpenses + inputs.desiredProfit) / billableHours
        : 0;
    const targetRevenue = billableHours * recommendedRate;
    const currentRevenue =
      inputs.currentRate !== null ? billableHours * inputs.currentRate : 0;
    const revenueGap = Math.max(0, targetRevenue - currentRevenue);

    return {
      totalExpenses,
      billableHours,
      breakEvenRate,
      recommendedRate,
      targetRevenue,
      currentRevenue,
      revenueGap
    };
  }, [inputs]);

  const revenueDenominator = Math.max(totals.targetRevenue, 1);
  const expensesWidth = Math.min(
    100,
    (totals.totalExpenses / revenueDenominator) * 100
  );
  const profitWidth = Math.min(
    100,
    (inputs.desiredProfit / revenueDenominator) * 100
  );

  function handleNumberChange(key: keyof LaborRateInputs, value: string): void {
    if (!hasTrackedUsage) {
      trackEvent('labor_rate_calculator_input_started');
      setHasTrackedUsage(true);
    }

    setInputs((prev) => ({
      ...prev,
      [key]: safeNumber(value)
    }));
  }

  return (
    <div className="grid gap-s6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-s4">
        <Card className="space-y-s4 border border-border bg-surface-default p-s4 shadow-sm">
          <div className="flex items-start gap-s3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-small font-semibold text-primary-700">
              1
            </div>
            <div className="space-y-s1">
              <h3 className="text-h3 text-text-primary">
                Monthly shop expenses
              </h3>
              <p className="text-small text-text-secondary">
                Add your recurring costs. Leave anything unknown as 0 for now.
              </p>
            </div>
          </div>
          <div className="grid gap-s4 sm:grid-cols-2">
            <div className="space-y-s1">
              <label className="text-small font-medium text-text-secondary">
                Rent / mortgage
              </label>
              <Input
                type="number"
                min={0}
                value={inputs.rent}
                onChange={(event) =>
                  handleNumberChange('rent', event.target.value)
                }
              />
            </div>
            <div className="space-y-s1">
              <label className="text-small font-medium text-text-secondary">
                Utilities
              </label>
              <Input
                type="number"
                min={0}
                value={inputs.utilities}
                onChange={(event) =>
                  handleNumberChange('utilities', event.target.value)
                }
              />
            </div>
            <div className="space-y-s1">
              <label className="text-small font-medium text-text-secondary">
                Insurance
              </label>
              <Input
                type="number"
                min={0}
                value={inputs.insurance}
                onChange={(event) =>
                  handleNumberChange('insurance', event.target.value)
                }
              />
            </div>
            <div className="space-y-s1">
              <label className="text-small font-medium text-text-secondary">
                Admin salaries
              </label>
              <Input
                type="number"
                min={0}
                value={inputs.adminSalaries}
                onChange={(event) =>
                  handleNumberChange('adminSalaries', event.target.value)
                }
              />
            </div>
            <div className="space-y-s1">
              <label className="text-small font-medium text-text-secondary">
                Software & tools
              </label>
              <Input
                type="number"
                min={0}
                value={inputs.software}
                onChange={(event) =>
                  handleNumberChange('software', event.target.value)
                }
              />
            </div>
            <div className="space-y-s1">
              <label className="text-small font-medium text-text-secondary">
                Other expenses
              </label>
              <Input
                type="number"
                min={0}
                value={inputs.otherCosts}
                onChange={(event) =>
                  handleNumberChange('otherCosts', event.target.value)
                }
              />
            </div>
          </div>
          <div className="rounded-md border border-dashed border-border bg-background-primary p-s3 text-small text-text-secondary">
            Total monthly expenses:{' '}
            <span className="font-semibold text-text-primary">
              {currencyFormatter.format(totals.totalExpenses)}
            </span>
          </div>
        </Card>

        <Card className="space-y-s4 border border-border bg-surface-default p-s4 shadow-sm">
          <div className="flex items-start gap-s3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-small font-semibold text-primary-700">
              2
            </div>
            <div className="space-y-s1">
              <h3 className="text-h3 text-text-primary">Technicians</h3>
              <p className="text-small text-text-secondary">
                How many techs generate billable labor each month?
              </p>
            </div>
          </div>
          <div className="max-w-[240px] space-y-s1">
            <label className="text-small font-medium text-text-secondary">
              Number of technicians
            </label>
            <Input
              type="number"
              min={0}
              value={inputs.technicians}
              onChange={(event) =>
                handleNumberChange('technicians', event.target.value)
              }
            />
          </div>
        </Card>

        <Card className="space-y-s4 border border-border bg-surface-default p-s4 shadow-sm">
          <div className="flex items-start gap-s3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-small font-semibold text-primary-700">
              3
            </div>
            <div className="space-y-s1">
              <h3 className="text-h3 text-text-primary">Work schedule</h3>
              <p className="text-small text-text-secondary">
                Estimate how many of those hours are truly billable.
              </p>
            </div>
          </div>
          <div className="grid gap-s4 sm:grid-cols-2">
            <div className="space-y-s1">
              <label className="text-small font-medium text-text-secondary">
                Hours per day
              </label>
              <Input
                type="number"
                min={0}
                step={0.5}
                value={inputs.hoursPerDay}
                onChange={(event) =>
                  handleNumberChange('hoursPerDay', event.target.value)
                }
              />
            </div>
            <div className="space-y-s1">
              <label className="text-small font-medium text-text-secondary">
                Working days / month
              </label>
              <Input
                type="number"
                min={0}
                value={inputs.daysPerMonth}
                onChange={(event) =>
                  handleNumberChange('daysPerMonth', event.target.value)
                }
              />
            </div>
            <div className="space-y-s1 sm:col-span-2">
              <label className="text-small font-medium text-text-secondary">
                Productivity (%)
              </label>
              <Input
                type="number"
                min={0}
                max={100}
                value={inputs.productivity}
                onChange={(event) =>
                  handleNumberChange('productivity', event.target.value)
                }
              />
              <p className="text-caption text-text-muted">
                Most independent repair shops run between 70% and 85%
                productivity.
              </p>
            </div>
          </div>
        </Card>

        <Card className="space-y-s4 border border-border bg-surface-default p-s4 shadow-sm">
          <div className="flex items-start gap-s3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-small font-semibold text-primary-700">
              4
            </div>
            <div className="space-y-s1">
              <h3 className="text-h3 text-text-primary">Profit goal</h3>
              <p className="text-small text-text-secondary">
                Add the monthly profit you want to take home.
              </p>
            </div>
          </div>
          <div className="max-w-[240px] space-y-s1">
            <label className="text-small font-medium text-text-secondary">
              Desired monthly profit
            </label>
            <Input
              type="number"
              min={0}
              value={inputs.desiredProfit}
              onChange={(event) =>
                handleNumberChange('desiredProfit', event.target.value)
              }
            />
          </div>
        </Card>
      </div>

      <div className="space-y-s4 lg:sticky lg:top-24 lg:self-start">
        <Card className="space-y-s3 border border-border bg-surface-default p-s4 shadow-sm">
          <p className="text-caption font-semibold uppercase text-primary-700">
            Results
          </p>
          <div className="grid gap-s3">
            <div className="rounded-md border border-border bg-background-primary p-s3">
              <p className="text-caption text-text-muted">
                Break-even labor rate
              </p>
              <p className="mt-1 text-[26px] font-semibold text-text-primary">
                {currencyFormatter.format(totals.breakEvenRate)} / hr
              </p>
            </div>
            <div className="rounded-md border border-primary-200 bg-primary-50/40 p-s3">
              <p className="text-caption text-text-muted">
                Recommended labor rate
              </p>
              <p className="mt-1 text-[26px] font-semibold text-text-primary">
                {currencyFormatter.format(totals.recommendedRate)} / hr
              </p>
            </div>
            <div className="rounded-md border border-border bg-background-primary p-s3">
              <p className="text-caption text-text-muted">
                Estimated monthly revenue
              </p>
              <p className="mt-1 text-[26px] font-semibold text-text-primary">
                {currencyFormatter.format(totals.targetRevenue)}
              </p>
            </div>
          </div>
          <p className="text-small text-text-secondary">
            Use the recommended rate as your pricing target, then track real
            labor revenue per job to confirm you’re hitting it.
          </p>
        </Card>

        <Card className="space-y-s3 border border-border bg-surface-default p-s4 shadow-sm">
          <p className="text-caption font-semibold uppercase text-primary-700">
            Revenue breakdown
          </p>
          <div className="space-y-s3">
            <div>
              <div className="flex items-center justify-between text-caption text-text-muted">
                <span>Expenses</span>
                <span>{currencyFormatter.format(totals.totalExpenses)}</span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-surface-hover">
                <div
                  className="h-2 rounded-full bg-red-400"
                  style={{ width: `${expensesWidth}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-caption text-text-muted">
                <span>Profit target</span>
                <span>{currencyFormatter.format(inputs.desiredProfit)}</span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-surface-hover">
                <div
                  className="h-2 rounded-full bg-emerald-500"
                  style={{ width: `${profitWidth}%` }}
                />
              </div>
            </div>
            <div className="rounded-md border border-border bg-background-primary p-s3">
              <p className="text-caption text-text-muted">Total revenue goal</p>
              <p className="mt-1 text-[20px] font-semibold text-text-primary">
                {currencyFormatter.format(totals.targetRevenue)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="space-y-s3 border border-border bg-surface-default p-s4 shadow-sm">
          <p className="text-caption font-semibold uppercase text-primary-700">
            Quick insight
          </p>
          <div className="space-y-s2">
            <label className="text-small font-medium text-text-secondary">
              Current labor rate (optional)
            </label>
            <Input
              type="number"
              min={0}
              value={inputs.currentRate ?? ''}
              onChange={(event) =>
                handleNumberChange('currentRate', event.target.value)
              }
            />
            {inputs.currentRate === null ? (
              <p className="text-small text-text-secondary">
                Enter your current labor rate above to see how it compares to
                your recommended rate.
              </p>
            ) : (
              <p className="text-small text-text-secondary">
                If you charge{' '}
                <span className="font-semibold text-text-primary">
                  {currencyFormatter.format(inputs.currentRate)} / hr
                </span>{' '}
                you may miss about{' '}
                <span className="font-semibold text-text-primary">
                  {currencyFormatter.format(totals.revenueGap)}
                </span>{' '}
                each month compared with the recommended rate.
              </p>
            )}
          </div>
        </Card>

        <Card className="space-y-s3 border border-border bg-primary-50 p-s4">
          <p className="text-caption font-semibold uppercase text-primary-700">
            Billable hours
          </p>
          <p className="text-[28px] font-semibold text-text-primary">
            {numberFormatter.format(totals.billableHours)} hrs
          </p>
          <p className="text-small text-text-secondary">
            Based on your tech count, schedule, and productivity.
          </p>
        </Card>
      </div>
    </div>
  );
}
