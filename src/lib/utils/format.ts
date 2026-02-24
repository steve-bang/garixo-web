type CurrencyFormatterOptions = {
  locale?: string;
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
};

type DateFormatterOptions = {
  locale?: string;
  fallback?: string;
  options?: Intl.DateTimeFormatOptions;
};

export function formatNumber(value: number, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale).format(value);
}

export function formatCurrency(value: number, options: CurrencyFormatterOptions = {}): string {
  const {
    locale = 'en-US',
    currency = 'USD',
    minimumFractionDigits = 0,
    maximumFractionDigits = 0
  } = options;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits
  }).format(value);
}

export function formatCurrencyUsd(value: number): string {
  return formatCurrency(value, { locale: 'en-US', currency: 'USD' });
}

export function formatDate(value?: string | null, config: DateFormatterOptions = {}): string {
  const { locale = 'en-US', fallback = '-', options } = config;

  if (!value) {
    return fallback;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return new Intl.DateTimeFormat(locale, options).format(date);
}

export function formatDateTime(value?: string): string {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}


export function formatMinutes(value?: number): string {
  if (!value) return '-';
  const h = Math.floor(value / 60);
  const m = value % 60;
  if (!h) return `${m}m`;
  if (!m) return `${h}h`;
  return `${h}h ${m}m`;
}
