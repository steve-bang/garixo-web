export const primitiveTokens = {
  color: {
    primary: {
      50: '210 100% 97%',
      100: '210 95% 93%',
      200: '212 92% 86%',
      300: '213 88% 76%',
      400: '214 84% 64%',
      500: '215 78% 52%',
      600: '216 74% 44%',
      700: '218 69% 36%',
      800: '220 63% 29%',
      900: '223 57% 22%'
    },
    slate: {
      50: '210 20% 98%',
      100: '220 18% 96%',
      200: '220 16% 91%',
      300: '219 14% 84%',
      400: '218 11% 65%',
      500: '220 9% 46%',
      600: '221 13% 37%',
      700: '222 18% 29%',
      800: '223 24% 22%',
      900: '224 30% 14%'
    },
    success: {
      50: '145 62% 96%',
      100: '146 55% 90%',
      200: '147 47% 80%',
      300: '148 42% 68%',
      400: '149 39% 56%',
      500: '150 45% 44%',
      600: '151 50% 36%',
      700: '152 54% 29%',
      800: '153 58% 23%',
      900: '154 60% 18%'
    },
    warning: {
      50: '44 100% 96%',
      100: '44 95% 89%',
      200: '43 92% 79%',
      300: '40 90% 68%',
      400: '37 87% 57%',
      500: '35 82% 48%',
      600: '31 79% 41%',
      700: '27 75% 34%',
      800: '24 71% 28%',
      900: '22 66% 22%'
    },
    error: {
      50: '0 86% 97%',
      100: '0 82% 93%',
      200: '0 78% 86%',
      300: '0 74% 76%',
      400: '0 70% 65%',
      500: '0 65% 54%',
      600: '0 60% 46%',
      700: '0 56% 38%',
      800: '0 52% 31%',
      900: '0 49% 24%'
    },
    info: {
      50: '199 100% 96%',
      100: '200 95% 90%',
      200: '201 90% 81%',
      300: '202 86% 70%',
      400: '203 82% 59%',
      500: '204 80% 49%',
      600: '205 77% 41%',
      700: '206 73% 34%',
      800: '207 68% 28%',
      900: '208 62% 22%'
    }
  },
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
  radius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem'
  },
  borderWidth: {
    default: '1px',
    strong: '2px'
  },
  shadow: {
    xs: '0 1px 2px 0 hsl(223 24% 12% / 0.06)',
    sm: '0 2px 8px -2px hsl(223 24% 12% / 0.08)',
    md: '0 8px 20px -6px hsl(223 24% 12% / 0.12)',
    lg: '0 18px 40px -14px hsl(223 24% 12% / 0.16)'
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

export const semanticTokens = {
  light: {
    background: {
      primary: primitiveTokens.color.slate[50],
      secondary: primitiveTokens.color.slate[100]
    },
    surface: {
      default: '0 0% 100%',
      hover: primitiveTokens.color.slate[100]
    },
    text: {
      primary: primitiveTokens.color.slate[900],
      secondary: primitiveTokens.color.slate[700],
      muted: primitiveTokens.color.slate[500],
      inverse: '0 0% 100%'
    },
    border: {
      default: primitiveTokens.color.slate[200],
      strong: primitiveTokens.color.slate[300]
    },
    status: {
      success: primitiveTokens.color.success[600],
      warning: primitiveTokens.color.warning[600],
      error: primitiveTokens.color.error[600],
      info: primitiveTokens.color.info[600]
    }
  },
  dark: {
    background: {
      primary: '222 35% 8%',
      secondary: '222 28% 12%'
    },
    surface: {
      default: '223 24% 14%',
      hover: '223 21% 18%'
    },
    text: {
      primary: '210 20% 98%',
      secondary: '214 18% 84%',
      muted: '215 14% 65%',
      inverse: primitiveTokens.color.slate[900]
    },
    border: {
      default: '223 18% 26%',
      strong: '223 16% 34%'
    },
    status: {
      success: primitiveTokens.color.success[400],
      warning: primitiveTokens.color.warning[400],
      error: primitiveTokens.color.error[400],
      info: primitiveTokens.color.info[400]
    }
  }
} as const;

export const componentTokens = {
  light: {
    button: {
      primary: {
        bg: primitiveTokens.color.primary[700],
        hover: primitiveTokens.color.primary[800],
        text: '0 0% 100%'
      },
      secondary: {
        bg: primitiveTokens.color.slate[100],
        hover: primitiveTokens.color.slate[200],
        text: primitiveTokens.color.slate[900]
      }
    },
    card: {
      bg: semanticTokens.light.surface.default,
      border: semanticTokens.light.border.default
    },
    input: {
      bg: semanticTokens.light.surface.default,
      border: semanticTokens.light.border.default,
      placeholder: semanticTokens.light.text.muted,
      text: semanticTokens.light.text.primary
    },
    badge: {
      success: {
        bg: primitiveTokens.color.success[100],
        text: primitiveTokens.color.success[800]
      }
    },
    table: {
      header: {
        bg: semanticTokens.light.background.secondary,
        text: semanticTokens.light.text.secondary
      }
    },
    sidebar: {
      background: '0 0% 100%',
      active: primitiveTokens.color.primary[50],
      activeText: primitiveTokens.color.primary[800]
    }
  },
  dark: {
    button: {
      primary: {
        bg: primitiveTokens.color.primary[500],
        hover: primitiveTokens.color.primary[400],
        text: '0 0% 100%'
      },
      secondary: {
        bg: '223 18% 22%',
        hover: '223 16% 28%',
        text: semanticTokens.dark.text.primary
      }
    },
    card: {
      bg: semanticTokens.dark.surface.default,
      border: semanticTokens.dark.border.default
    },
    input: {
      bg: semanticTokens.dark.surface.default,
      border: semanticTokens.dark.border.default,
      placeholder: semanticTokens.dark.text.muted,
      text: semanticTokens.dark.text.primary
    },
    badge: {
      success: {
        bg: '152 48% 18%',
        text: primitiveTokens.color.success[200]
      }
    },
    table: {
      header: {
        bg: semanticTokens.dark.background.secondary,
        text: semanticTokens.dark.text.secondary
      }
    },
    sidebar: {
      background: '223 24% 10%',
      active: '221 44% 22%',
      activeText: semanticTokens.dark.text.primary
    }
  }
} as const;

export const designTokens = {
  primitive: primitiveTokens,
  semantic: semanticTokens,
  component: componentTokens
} as const;

export type DesignTokens = typeof designTokens;
