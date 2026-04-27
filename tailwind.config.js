/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'brick-red': '#C8432B',
        ember: '#E85D3A',
        mortar: '#1C1A18',
        ash: '#2E2B28',
        dust: '#4A4540',
        iron: '#8C8078',
        sand: '#D4C9B8',
        chalk: '#F0EBE3',
      },
      fontFamily: {
        display: ['"Barlow Condensed"', 'system-ui', 'sans-serif'],
        sans: ['Barlow', 'system-ui', 'sans-serif'],
        mono: ['"DM Mono"', 'ui-monospace', 'monospace'],
      },
      minHeight: {
        tap: '48px',
      },
      minWidth: {
        tap: '48px',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        checkBounce: {
          '0%':   { transform: 'scale(1)' },
          '40%':  { transform: 'scale(1.25)' },
          '70%':  { transform: 'scale(0.92)' },
          '100%': { transform: 'scale(1)' },
        },
        prPop: {
          '0%':   { opacity: '0', transform: 'scale(0.5)' },
          '60%':  { transform: 'scale(1.15)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        shimmer:        'shimmer 1.6s ease-in-out infinite',
        'slide-up':     'slideUp 200ms ease-out forwards',
        'check-bounce': 'checkBounce 320ms cubic-bezier(0.34,1.56,0.64,1) forwards',
        'pr-pop':       'prPop 280ms cubic-bezier(0.34,1.56,0.64,1) forwards',
      },
    },
  },
  plugins: [],
}
