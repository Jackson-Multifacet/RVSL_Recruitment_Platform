/**
 * Design Tokens - Centralized design system configuration
 * Use these tokens across all components for consistency
 */

export const TOKENS = {
  // Spacing Scale (4px base unit)
  space: {
    xs: '0.25rem', // 4px
    sm: '0.5rem', // 8px
    md: '0.75rem', // 12px
    lg: '1rem', // 16px
    xl: '1.5rem', // 24px
    '2xl': '2rem', // 32px
    '3xl': '3rem', // 48px
    '4xl': '4rem', // 64px
  },

  // Border Radius
  radius: {
    xs: '0.375rem', // 6px
    sm: '0.5rem', // 8px
    md: '0.75rem', // 12px
    lg: '1rem', // 16px
    xl: '1.5rem', // 24px
    full: '9999px',
  },

  // Color Palette
  colors: {
    // Primary
    primary: {
      50: '#fff7ed',
      100: '#fed7aa',
      200: '#fdba74',
      300: '#fb923c',
      400: '#f97316',
      500: '#f97316', // Orange-600 (main)
      600: '#ea580c',
      700: '#c2410c',
      800: '#9a3412',
      900: '#7c2d12',
    },
    // Slate (Neutral)
    slate: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
    // Accent Colors
    accent: {
      blue: '#0ea5e9',
      cyan: '#06b6d4',
      purple: '#a855f7',
      pink: '#ec4899',
      amber: '#f59e0b',
      green: '#10b981',
      red: '#ef4444',
    },
  },

  // Typography
  font: {
    family: {
      sans: '"Inter", ui-sans-serif, system-ui, sans-serif',
      serif: '"Cormorant Garamond", serif',
      mono: '"JetBrains Mono", monospace',
    },
    size: {
      xs: '0.75rem', // 12px
      sm: '0.875rem', // 14px
      base: '1rem', // 16px
      lg: '1.125rem', // 18px
      xl: '1.25rem', // 20px
      '2xl': '1.5rem', // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem', // 48px
      '6xl': '3.75rem', // 60px
    },
    weight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2,
    },
  },

  // Shadows
  shadow: {
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },

  // Transitions
  transition: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '350ms cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Z-Index Scale
  zIndex: {
    hide: -1,
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },

  // Component Size Presets
  size: {
    button: {
      xs: 'px-3 py-1.5 text-xs',
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-2.5 text-base',
      lg: 'px-8 py-3 text-lg',
      xl: 'px-10 py-4 text-lg',
    },
    input: {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2.5 text-base',
      lg: 'px-6 py-3 text-lg',
    },
    icon: {
      xs: 'w-3 h-3',
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
      xl: 'w-8 h-8',
    },
  },

  // Focus States
  focus: {
    ring: '2px',
    offset: '2px',
  },

  // Breakpoints (for reference in components)
  breakpoint: {
    xs: '320px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const;

// Helper function to access nested tokens
export function getToken(path: string): any {
  return path.split('.').reduce((obj: any, key: string) => obj?.[key], TOKENS);
}

// CSS Custom Properties (for use in CSS)
export const cssVariables = `
  :root {
    /* Spacing */
    --space-xs: 0.25rem;
    --space-sm: 0.5rem;
    --space-md: 0.75rem;
    --space-lg: 1rem;
    --space-xl: 1.5rem;
    --space-2xl: 2rem;

    /* Colors */
    --color-primary: #f97316;
    --color-primary-light: #fed7aa;
    --color-primary-dark: #ea580c;
    
    --color-slate-50: #f8fafc;
    --color-slate-900: #0f172a;
    
    /* Typography */
    --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
    --font-serif: "Cormorant Garamond", serif;
    --font-mono: "JetBrains Mono", monospace;

    /* Transitions */
    --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
    --transition-base: 250ms cubic-bezier(0.4, 0, 0.2, 1);
    --transition-slow: 350ms cubic-bezier(0.4, 0, 0.2, 1);
  }
`;
