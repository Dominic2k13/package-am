import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-orange':        '#FF5A1F',
        'brand-orange-light':  '#FF7A45',
        'brand-orange-dark':   '#D94510',
        'brand-yellow':        '#FFB800',
        'brand-green':         '#22C55E',
        'brand-bg':            '#FFF8F4',
        'brand-dark':          '#1A0A00',
        'brand-text':          '#3D1F00',
        'brand-muted':         '#9A7055',
        'brand-border':        '#FFE0D0',
        'brand-cashback':      '#7C3AED',
        'brand-cashback-light':'#EDE9FE',
      },
      fontFamily: {
        syne:     ['var(--font-syne)', 'sans-serif'],
        'dm-sans':['var(--font-dm-sans)', 'sans-serif'],
      },
      animation: {
        'fade-up':        'fadeUp 0.6s ease forwards',
        'hero-float':     'heroFloat 3s ease-in-out infinite',
        'slide-in-right': 'slideInRight 0.35s cubic-bezier(.4,0,.2,1) forwards',
        'slide-out-right':'slideOutRight 0.3s cubic-bezier(.4,0,.2,1) forwards',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        heroFloat: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%':     { transform: 'translateY(-14px)' },
        },
        slideInRight: {
          from: { transform: 'translateX(100%)' },
          to:   { transform: 'translateX(0)' },
        },
        slideOutRight: {
          from: { transform: 'translateX(0)' },
          to:   { transform: 'translateX(100%)' },
        },
      },
      boxShadow: {
        card:       '0 4px 24px rgba(255,90,31,0.10)',
        'card-hover':'0 12px 36px rgba(255,90,31,0.18)',
        nav:        '0 2px 20px rgba(26,10,0,0.07)',
      },
    },
  },
  plugins: [],
}

export default config
