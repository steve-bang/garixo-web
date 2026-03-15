'use client';

import Link from 'next/link';
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

type ProfitInputs = {
  jobsPerDay: number;
  averageJobValue: number;
  workingDays: number;
  technicians: number;
  technicianSalary: number;
  rent: number;
  utilities: number;
  insurance: number;
  adminSalary: number;
  software: number;
  toolsMaintenance: number;
  otherExpenses: number;
  partsCostPerJob: number;
};

const defaultInputs: ProfitInputs = {
  jobsPerDay: 12,
  averageJobValue: 180,
  workingDays: 22,
  technicians: 3,
  technicianSalary: 3500,
  rent: 2500,
  utilities: 400,
  insurance: 350,
  adminSalary: 2500,
  software: 200,
  toolsMaintenance: 300,
  otherExpenses: 500,
  partsCostPerJob: 60
};

function safeNumber(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function ShopProfitCalculator(): JSX.Element {
  const [inputs, setInputs] = useState<ProfitInputs>(defaultInputs);
  const [hasTrackedUsage, setHasTrackedUsage] = useState(false);

  useEffect(() => {
    trackEvent('shop_profit_calculator_view');
  }, []);

  const totals = useMemo(() => {
    const monthlyRevenue =
      inputs.jobsPerDay * inputs.averageJobValue * inputs.workingDays;

    const partsCost =
      inputs.jobsPerDay * inputs.partsCostPerJob * inputs.workingDays;

    const laborCost = inputs.technicians * inputs.technicianSalary;

    const overheadExpenses =
      inputs.rent +
      inputs.utilities +
      inputs.insurance +
      inputs.adminSalary +
      inputs.software +
      inputs.toolsMaintenance +
      inputs.otherExpenses;

    const totalCosts = partsCost + laborCost + overheadExpenses;
    const profit = monthlyRevenue - totalCosts;
    const profitMargin = monthlyRevenue > 0 ? profit / monthlyRevenue : 0;

    return {
      monthlyRevenue,
      partsCost,
      laborCost,
      overheadExpenses,
      totalCosts,
      profit,
      profitMargin
    };
  }, [inputs]);

  const revenueDenominator = Math.max(totals.monthlyRevenue, 1);
  const partsWidth = Math.min(
    100,
    (totals.partsCost / revenueDenominator) * 100
  );
  const laborWidth = Math.min(
    100,
    (totals.laborCost / revenueDenominator) * 100
  );
  const overheadWidth = Math.min(
    100,
    (totals.overheadExpenses / revenueDenominator) * 100
  );
  const profitWidth = Math.min(
    100,
    (Math.max(totals.profit, 0) / revenueDenominator) * 100
  );

  const profitMarginPercent = totals.profitMargin * 100;
  const isBelowHealthyMargin =
    profitMarginPercent > 0 && profitMarginPercent < 20;

  function handleNumberChange(key: keyof ProfitInputs, value: string): void {
    if (!hasTrackedUsage) {
      trackEvent('shop_profit_calculator_input_started');
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
              <h3 className="text-h3 text-text-primary">Monthly revenue</h3>
              <p className="text-small text-text-secondary">
                Estimate how much work your shop completes each month.
              </p>
            </div>
          </div>
          <div className="grid gap-s4 sm:grid-cols-2">
            <div className="space-y-s1">
              <label className="text-small font-medium text-text-secondary">
                Average jobs per day
              </label>
              <Input
                type="number"
                min={0}
                value={inputs.jobsPerDay}
                onChange={(event) =>
                  handleNumberChange('jobsPerDay', event.target.value)
                }
              />
            </div>
            <div className="space-y-s1">
              <label className="text-small font-medium text-text-secondary">
                Average job value
              </label>
              <Input
                type="number"
                min={0}
                value={inputs.averageJobValue}
                onChange={(event) =>
                  handleNumberChange('averageJobValue', event.target.value)
                }
              />
            </div>
            <div className="space-y-s1 sm:col-span-2">
              <label className="text-small font-medium text-text-secondary">
                Working days per month
              </label>
              <Input
                type="number"
                min={0}
                value={inputs.workingDays}
                onChange={(event) =>
                  handleNumberChange('workingDays', event.target.value)
                }
              />
            </div>
          </div>
          <div className="rounded-md border border-dashed border-border bg-background-primary p-s3 text-small text-text-secondary">
            Estimated monthly revenue:{' '}
            <span className="font-semibold text-text-primary">
              {currencyFormatter.format(totals.monthlyRevenue)}
            </span>
          </div>
        </Card>

        <Card className="space-y-s4 border border-border bg-surface-default p-s4 shadow-sm">
          <div className="flex items-start gap-s3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-small font-semibold text-primary-700">
              2
            </div>
            <div className="space-y-s1">
              <h3 className="text-h3 text-text-primary">Labor cost</h3>
              <p className="text-small text-text-secondary">
                Add your technician pay to see the real labor expense.
              </p>
            </div>
          </div>
          <div className="grid gap-s4 sm:grid-cols-2">
            <div className="space-y-s1">
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
            <div className="space-y-s1">
              <label className="text-small font-medium text-text-secondary">
                Avg monthly salary per tech
              </label>
              <Input
                type="number"
                min={0}
                value={inputs.technicianSalary}
                onChange={(event) =>
                  handleNumberChange('technicianSalary', event.target.value)
                }
              />
            </div>
          </div>
        </Card>

        <Card className="space-y-s4 border border-border bg-surface-default p-s4 shadow-sm">
          <div className="flex items-start gap-s3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-small font-semibold text-primary-700">
              3
            </div>
            <div className="space-y-s1">
              <h3 className="text-h3 text-text-primary">Shop expenses</h3>
              <p className="text-small text-text-secondary">
                Include fixed costs that keep your doors open.
              </p>
            </div>
          </div>
          <div className="grid gap-s4 sm:grid-cols-2">
            <div className="space-y-s1">
              <label className="text-small font-medium text-text-secondary">
                Rent
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
                Admin salary
              </label>
              <Input
                type="number"
                min={0}
                value={inputs.adminSalary}
                onChange={(event) =>
                  handleNumberChange('adminSalary', event.target.value)
                }
              />
            </div>
            <div className="space-y-s1">
              <label className="text-small font-medium text-text-secondary">
                Software
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
                Tools & maintenance
              </label>
              <Input
                type="number"
                min={0}
                value={inputs.toolsMaintenance}
                onChange={(event) =>
                  handleNumberChange('toolsMaintenance', event.target.value)
                }
              />
            </div>
            <div className="space-y-s1 sm:col-span-2">
              <label className="text-small font-medium text-text-secondary">
                Other expenses
              </label>
              <Input
                type="number"
                min={0}
                value={inputs.otherExpenses}
                onChange={(event) =>
                  handleNumberChange('otherExpenses', event.target.value)
                }
              />
            </div>
          </div>
          <div className="rounded-md border border-dashed border-border bg-background-primary p-s3 text-small text-text-secondary">
            Total overhead expenses:{' '}
            <span className="font-semibold text-text-primary">
              {currencyFormatter.format(totals.overheadExpenses)}
            </span>
          </div>
        </Card>

        <Card className="space-y-s4 border border-border bg-surface-default p-s4 shadow-sm">
          <div className="flex items-start gap-s3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-small font-semibold text-primary-700">
              4
            </div>
            <div className="space-y-s1">
              <h3 className="text-h3 text-text-primary">Parts cost</h3>
              <p className="text-small text-text-secondary">
                Many shops forget parts costs. Add your average parts cost per
                job.
              </p>
            </div>
          </div>
          <div className="max-w-[280px] space-y-s1">
            <label className="text-small font-medium text-text-secondary">
              Average parts cost per job
            </label>
            <Input
              type="number"
              min={0}
              value={inputs.partsCostPerJob}
              onChange={(event) =>
                handleNumberChange('partsCostPerJob', event.target.value)
              }
            />
          </div>
        </Card>
      </div>

      <div className="space-y-s4">
        <Card className="space-y-s3 border border-border bg-surface-default p-s4 shadow-sm">
          <p className="text-caption font-semibold uppercase text-primary-700">
            Results
          </p>
          <div className="grid gap-s3">
            <div className="rounded-md border border-border bg-background-primary p-s3">
              <p className="text-caption text-text-muted">Monthly revenue</p>
              <p className="mt-1 text-[26px] font-semibold text-text-primary">
                {currencyFormatter.format(totals.monthlyRevenue)}
              </p>
            </div>
            <div className="rounded-md border border-border bg-background-primary p-s3">
              <p className="text-caption text-text-muted">Total costs</p>
              <p className="mt-1 text-[26px] font-semibold text-text-primary">
                {currencyFormatter.format(totals.totalCosts)}
              </p>
            </div>
            <div className="rounded-md border border-border bg-background-primary p-s3">
              <p className="text-caption text-text-muted">Monthly profit</p>
              <p
                className={`mt-1 text-[26px] font-semibold ${
                  totals.profit >= 0 ? 'text-emerald-600' : 'text-red-600'
                }`}
              >
                {currencyFormatter.format(totals.profit)}
              </p>
            </div>
            <div className="rounded-md border border-border bg-background-primary p-s3">
              <p className="text-caption text-text-muted">Profit margin</p>
              <p className="mt-1 text-[26px] font-semibold text-text-primary">
                {numberFormatter.format(profitMarginPercent)}%
              </p>
            </div>
          </div>
          <div className="rounded-md border border-border bg-background-primary p-s3 text-small text-text-secondary">
            Healthy repair shops typically run at{' '}
            <span className="font-semibold text-text-primary">20–30%</span>{' '}
            profit margin.
          </div>
          {isBelowHealthyMargin ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-s3 text-small text-amber-700">
              ⚠ Your margin is below 20%. Review labor cost, parts pricing, or
              job volume to protect profitability.
            </div>
          ) : null}
          <p className="text-small text-text-secondary">
            Want to check if your hourly labor rate supports this profit target?
            <Link
              href="/tools/auto-repair-labor-rate-calculator"
              className="ml-1 font-medium text-primary-700 underline-offset-2 hover:underline"
            >
              → Try the Auto Repair Labor Rate Calculator
            </Link>
          </p>
        </Card>

        <Card className="space-y-s3 border border-border bg-surface-default p-s4 shadow-sm">
          <p className="text-caption font-semibold uppercase text-primary-700">
            Profit visualization
          </p>
          <div className="space-y-s4">
            <div>
              <div className="flex items-center justify-between text-caption text-text-muted">
                <span>Revenue</span>
                <span>{currencyFormatter.format(totals.monthlyRevenue)}</span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-blue-100">
                <div className="h-2 w-full rounded-full bg-blue-500" />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-caption text-text-muted">
                <span>Parts cost</span>
                <span>{currencyFormatter.format(totals.partsCost)}</span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-surface-hover">
                <div
                  className="h-2 rounded-full bg-red-400"
                  style={{ width: `${partsWidth}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-caption text-text-muted">
                <span>Labor cost</span>
                <span>{currencyFormatter.format(totals.laborCost)}</span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-surface-hover">
                <div
                  className="h-2 rounded-full bg-red-500"
                  style={{ width: `${laborWidth}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-caption text-text-muted">
                <span>Overhead expenses</span>
                <span>{currencyFormatter.format(totals.overheadExpenses)}</span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-surface-hover">
                <div
                  className="h-2 rounded-full bg-red-300"
                  style={{ width: `${overheadWidth}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-caption text-text-muted">
                <span>Profit</span>
                <span>{currencyFormatter.format(totals.profit)}</span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-surface-hover">
                <div
                  className="h-2 rounded-full bg-emerald-500"
                  style={{ width: `${profitWidth}%` }}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="space-y-s3 border border-border bg-primary-50 p-s4">
          <p className="text-caption font-semibold uppercase text-primary-700">
            Business insight
          </p>
          <p className="text-small text-text-secondary">
            Your shop is generating{' '}
            <span className="font-semibold text-text-primary">
              {currencyFormatter.format(totals.monthlyRevenue)}
            </span>{' '}
            per month. After costs, your profit is{' '}
            <span className="font-semibold text-text-primary">
              {currencyFormatter.format(totals.profit)}
            </span>{' '}
            with a{' '}
            <span className="font-semibold text-text-primary">
              {numberFormatter.format(profitMarginPercent)}%
            </span>{' '}
            margin.
          </p>
        </Card>
      </div>
    </div>
  );
}
