import type { Config } from 'tailwindcss';

const primitive = {
  spacing: {
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem'
  },
  typography: {
    display: {
      size: '2rem',
      lineHeight: '2.5rem',
      letterSpacing: '-0.02em',
      weight: '700'
    },
    h1: {
      size: '1.75rem',
      lineHeight: '2.25rem',
      letterSpacing: '-0.015em',
      weight: '700'
    },
    h2: {
      size: '1.5rem',
      lineHeight: '2rem',
      letterSpacing: '-0.01em',
      weight: '600'
    },
    h3: {
      size: '1.25rem',
      lineHeight: '1.75rem',
      letterSpacing: '-0.005em',
      weight: '600'
    },
    body: {
      size: '1rem',
      lineHeight: '1.5rem',
      letterSpacing: '0',
      weight: '400'
    },
    small: {
      size: '0.875rem',
      lineHeight: '1.25rem',
      letterSpacing: '0',
      weight: '400'
    },
    caption: {
      size: '0.75rem',
      lineHeight: '1rem',
      letterSpacing: '0.01em',
      weight: '500'
    }
  }
} as const;

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  safelist: [
    'text-base',
    'text-lg',
    'text-xl',
    'text-2xl',
    'text-3xl',
    'font-medium',
    'font-semibold',
    'font-bold',
    'leading-relaxed',
    'underline',
    'mt-2',
    'mt-3',
    'mt-4',
    'mt-6',
    'mb-2',
    'mb-4',
    'text-gray-700',
    'text-gray-800',
    'text-gray-900',
    'text-blue-600',
    'text-blue-700',
    'md:text-2xl',
    'md:text-3xl'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'hsl(var(--primary-50) / <alpha-value>)',
          100: 'hsl(var(--primary-100) / <alpha-value>)',
          200: 'hsl(var(--primary-200) / <alpha-value>)',
          300: 'hsl(var(--primary-300) / <alpha-value>)',
          400: 'hsl(var(--primary-400) / <alpha-value>)',
          500: 'hsl(var(--primary-500) / <alpha-value>)',
          600: 'hsl(var(--primary-600) / <alpha-value>)',
          700: 'hsl(var(--primary-700) / <alpha-value>)',
          800: 'hsl(var(--primary-800) / <alpha-value>)',
          900: 'hsl(var(--primary-900) / <alpha-value>)'
        },
        slate: {
          50: 'hsl(var(--slate-50) / <alpha-value>)',
          100: 'hsl(var(--slate-100) / <alpha-value>)',
          200: 'hsl(var(--slate-200) / <alpha-value>)',
          300: 'hsl(var(--slate-300) / <alpha-value>)',
          400: 'hsl(var(--slate-400) / <alpha-value>)',
          500: 'hsl(var(--slate-500) / <alpha-value>)',
          600: 'hsl(var(--slate-600) / <alpha-value>)',
          700: 'hsl(var(--slate-700) / <alpha-value>)',
          800: 'hsl(var(--slate-800) / <alpha-value>)',
          900: 'hsl(var(--slate-900) / <alpha-value>)'
        },
        success: {
          50: 'hsl(var(--success-50) / <alpha-value>)',
          100: 'hsl(var(--success-100) / <alpha-value>)',
          200: 'hsl(var(--success-200) / <alpha-value>)',
          300: 'hsl(var(--success-300) / <alpha-value>)',
          400: 'hsl(var(--success-400) / <alpha-value>)',
          500: 'hsl(var(--success-500) / <alpha-value>)',
          600: 'hsl(var(--success-600) / <alpha-value>)',
          700: 'hsl(var(--success-700) / <alpha-value>)',
          800: 'hsl(var(--success-800) / <alpha-value>)',
          900: 'hsl(var(--success-900) / <alpha-value>)'
        },
        warning: {
          50: 'hsl(var(--warning-50) / <alpha-value>)',
          100: 'hsl(var(--warning-100) / <alpha-value>)',
          200: 'hsl(var(--warning-200) / <alpha-value>)',
          300: 'hsl(var(--warning-300) / <alpha-value>)',
          400: 'hsl(var(--warning-400) / <alpha-value>)',
          500: 'hsl(var(--warning-500) / <alpha-value>)',
          600: 'hsl(var(--warning-600) / <alpha-value>)',
          700: 'hsl(var(--warning-700) / <alpha-value>)',
          800: 'hsl(var(--warning-800) / <alpha-value>)',
          900: 'hsl(var(--warning-900) / <alpha-value>)'
        },
        error: {
          50: 'hsl(var(--error-50) / <alpha-value>)',
          100: 'hsl(var(--error-100) / <alpha-value>)',
          200: 'hsl(var(--error-200) / <alpha-value>)',
          300: 'hsl(var(--error-300) / <alpha-value>)',
          400: 'hsl(var(--error-400) / <alpha-value>)',
          500: 'hsl(var(--error-500) / <alpha-value>)',
          600: 'hsl(var(--error-600) / <alpha-value>)',
          700: 'hsl(var(--error-700) / <alpha-value>)',
          800: 'hsl(var(--error-800) / <alpha-value>)',
          900: 'hsl(var(--error-900) / <alpha-value>)'
        },
        info: {
          50: 'hsl(var(--info-50) / <alpha-value>)',
          100: 'hsl(var(--info-100) / <alpha-value>)',
          200: 'hsl(var(--info-200) / <alpha-value>)',
          300: 'hsl(var(--info-300) / <alpha-value>)',
          400: 'hsl(var(--info-400) / <alpha-value>)',
          500: 'hsl(var(--info-500) / <alpha-value>)',
          600: 'hsl(var(--info-600) / <alpha-value>)',
          700: 'hsl(var(--info-700) / <alpha-value>)',
          800: 'hsl(var(--info-800) / <alpha-value>)',
          900: 'hsl(var(--info-900) / <alpha-value>)'
        },
        background: {
          primary: 'hsl(var(--color-background-primary) / <alpha-value>)',
          secondary: 'hsl(var(--color-background-secondary) / <alpha-value>)'
        },
        surface: {
          default: 'hsl(var(--color-surface-default) / <alpha-value>)',
          hover: 'hsl(var(--color-surface-hover) / <alpha-value>)'
        },
        text: {
          primary: 'hsl(var(--color-text-primary) / <alpha-value>)',
          secondary: 'hsl(var(--color-text-secondary) / <alpha-value>)',
          muted: 'hsl(var(--color-text-muted) / <alpha-value>)',
          inverse: 'hsl(var(--color-text-inverse) / <alpha-value>)'
        },
        border: {
          DEFAULT: 'hsl(var(--color-border-default) / <alpha-value>)',
          strong: 'hsl(var(--color-border-strong) / <alpha-value>)'
        },
        state: {
          success: 'hsl(var(--color-success) / <alpha-value>)',
          warning: 'hsl(var(--color-warning) / <alpha-value>)',
          error: 'hsl(var(--color-error) / <alpha-value>)',
          info: 'hsl(var(--color-info) / <alpha-value>)'
        },
        button: {
          primary: 'hsl(var(--button-primary-bg) / <alpha-value>)',
          'primary-hover': 'hsl(var(--button-primary-hover) / <alpha-value>)',
          'primary-text': 'hsl(var(--button-primary-text) / <alpha-value>)',
          secondary: 'hsl(var(--button-secondary-bg) / <alpha-value>)',
          'secondary-hover':
            'hsl(var(--button-secondary-hover) / <alpha-value>)',
          'secondary-text': 'hsl(var(--button-secondary-text) / <alpha-value>)'
        },
        card: {
          DEFAULT: 'hsl(var(--card-default-bg) / <alpha-value>)',
          foreground: 'hsl(var(--card-default-foreground) / <alpha-value>)',
          border: 'hsl(var(--card-default-border) / <alpha-value>)'
        },
        input: {
          DEFAULT: 'hsl(var(--input-default-bg) / <alpha-value>)',
          foreground: 'hsl(var(--input-default-text) / <alpha-value>)',
          border: 'hsl(var(--input-default-border) / <alpha-value>)',
          placeholder: 'hsl(var(--input-default-placeholder) / <alpha-value>)'
        },
        badge: {
          success: 'hsl(var(--badge-success-bg) / <alpha-value>)',
          'success-text': 'hsl(var(--badge-success-text) / <alpha-value>)'
        },
        table: {
          header: 'hsl(var(--table-header-bg) / <alpha-value>)',
          'header-text': 'hsl(var(--table-header-text) / <alpha-value>)'
        },
        sidebar: {
          background: 'hsl(var(--sidebar-background) / <alpha-value>)',
          foreground: 'hsl(var(--sidebar-foreground) / <alpha-value>)',
          active: 'hsl(var(--sidebar-active-bg) / <alpha-value>)',
          'active-text': 'hsl(var(--sidebar-active-text) / <alpha-value>)',
          border: 'hsl(var(--sidebar-border) / <alpha-value>)'
        }
      },
      spacing: {
        s1: primitive.spacing[1],
        s2: primitive.spacing[2],
        s3: primitive.spacing[3],
        s4: primitive.spacing[4],
        s6: primitive.spacing[6],
        s8: primitive.spacing[8],
        s10: primitive.spacing[10],
        s12: primitive.spacing[12],
        s16: primitive.spacing[16]
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)'
      },
      borderWidth: {
        DEFAULT: 'var(--border-width-default)',
        strong: 'var(--border-width-strong)'
      },
      boxShadow: {
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)'
      },
      fontSize: {
        display: [
          primitive.typography.display.size,
          {
            lineHeight: primitive.typography.display.lineHeight,
            letterSpacing: primitive.typography.display.letterSpacing,
            fontWeight: primitive.typography.display.weight
          }
        ],
        h1: [
          primitive.typography.h1.size,
          {
            lineHeight: primitive.typography.h1.lineHeight,
            letterSpacing: primitive.typography.h1.letterSpacing,
            fontWeight: primitive.typography.h1.weight
          }
        ],
        h2: [
          primitive.typography.h2.size,
          {
            lineHeight: primitive.typography.h2.lineHeight,
            letterSpacing: primitive.typography.h2.letterSpacing,
            fontWeight: primitive.typography.h2.weight
          }
        ],
        h3: [
          primitive.typography.h3.size,
          {
            lineHeight: primitive.typography.h3.lineHeight,
            letterSpacing: primitive.typography.h3.letterSpacing,
            fontWeight: primitive.typography.h3.weight
          }
        ],
        body: [
          primitive.typography.body.size,
          {
            lineHeight: primitive.typography.body.lineHeight,
            letterSpacing: primitive.typography.body.letterSpacing,
            fontWeight: primitive.typography.body.weight
          }
        ],
        small: [
          primitive.typography.small.size,
          {
            lineHeight: primitive.typography.small.lineHeight,
            letterSpacing: primitive.typography.small.letterSpacing,
            fontWeight: primitive.typography.small.weight
          }
        ],
        caption: [
          primitive.typography.caption.size,
          {
            lineHeight: primitive.typography.caption.lineHeight,
            letterSpacing: primitive.typography.caption.letterSpacing,
            fontWeight: primitive.typography.caption.weight
          }
        ]
      }
    }
  },
  plugins: []
};

export default config;
