import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ["'IBM Plex Sans'", 'sans-serif'],
        headline: ["'IBM Plex Sans'", 'sans-serif'],
        code: ["'JetBrains Mono'", 'monospace'],
      },
      colors: {
        background: '#0D1117',
        foreground: '#C9D1D9',
        card: {
          DEFAULT: '#161B22',
          foreground: '#C9D1D9',
        },
        popover: {
          DEFAULT: '#161B22',
          foreground: '#C9D1D9',
        },
        primary: {
          DEFAULT: '#58A6FF',
          foreground: '#0D1117',
        },
        secondary: {
          DEFAULT: '#30363D',
          foreground: '#C9D1D9',
        },
        muted: {
          DEFAULT: '#21262D',
          foreground: '#8B949E',
        },
        accent: {
          DEFAULT: '#58A6FF',
          foreground: '#0D1117',
        },
        destructive: {
          DEFAULT: '#F85149',
          foreground: '#FFFFFF',
        },
        border: '#30363D',
        input: '#21262D',
        ring: '#58A6FF',
        chart: {
          '1': '#58A6FF',
          '2': '#3FB950',
          '3': '#D29922',
          '4': '#F85149',
          '5': '#BC8CFF',
        },
        sidebar: {
          DEFAULT: '#0D1117',
          foreground: '#C9D1D9',
          primary: '#58A6FF',
          'primary-foreground': '#0D1117',
          accent: '#161B22',
          'accent-foreground': '#58A6FF',
          border: '#30363D',
          ring: '#58A6FF',
        },
      },
      borderRadius: {
        lg: '2px',
        md: '1px',
        sm: '0px',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.1s ease-out',
        'accordion-up': 'accordion-up 0.1s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
