/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1280px',
      },
    },
    extend: {
      colors: {
        // Background colors
        'bg-base': '#000000',
        'bg-primary': '#0a0a0f',
        'bg-elevated': '#12121a',
        'bg-interactive': '#1e1e2e',
        'bg-overlay': 'rgba(0,0,0,0.85)',
        // Accent colors
        'accent-primary': '#00d4ff',
        'accent-primary-hover': '#33e0ff',
        'accent-primary-glow': 'rgba(0,212,255,0.4)',
        'accent-secondary': '#ffb800',
        'accent-secondary-glow': 'rgba(255,184,0,0.3)',
        // Text colors
        'text-primary': '#e4e4e7',
        'text-secondary': '#a1a1aa',
        'text-tertiary': '#71717a',
        'text-accent': '#00d4ff',
        // Semantic colors
        'success': '#22c55e',
        'warning': '#f59e0b',
        'error': '#ef4444',
        'info': '#3b82f6',
        // Border colors
        'border-subtle': 'rgba(255,255,255,0.08)',
        'border-default': 'rgba(255,255,255,0.12)',
        'border-strong': 'rgba(255,255,255,0.18)',
        'border-accent': 'rgba(0,212,255,0.5)',
      },
      fontFamily: {
        display: ["'Space Grotesk'", 'sans-serif'],
        body: ["'Inter'", '-apple-system', 'sans-serif'],
        mono: ["'JetBrains Mono'", "'Fira Code'", 'monospace'],
      },
      fontSize: {
        'display-lg': ['48px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-md': ['36px', { lineHeight: '1.15', letterSpacing: '-0.015em', fontWeight: '600' }],
        'heading-lg': ['24px', { lineHeight: '1.25', letterSpacing: '-0.01em', fontWeight: '600' }],
        'heading-md': ['20px', { lineHeight: '1.3', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-md': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '1.5', letterSpacing: '0.01em', fontWeight: '400' }],
        'data-lg': ['32px', { lineHeight: '1.2', fontWeight: '500' }],
        'data-md': ['24px', { lineHeight: '1.2', fontWeight: '500' }],
        'data-sm': ['16px', { lineHeight: '1.3', fontWeight: '400' }],
      },
      spacing: {
        'space-1': '4px',
        'space-2': '8px',
        'space-3': '12px',
        'space-4': '16px',
        'space-5': '24px',
        'space-6': '32px',
        'space-8': '48px',
        'space-10': '64px',
        'space-12': '80px',
      },
      borderRadius: {
        'sm': '6px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        'full': '9999px',
      },
      boxShadow: {
        'card': '0 4px 24px rgba(0,0,0,0.4)',
        'glow-accent': '0 0 20px rgba(0,212,255,0.4), 0 0 40px rgba(0,212,255,0.2)',
        'glow-lunar': '0 0 30px rgba(255,184,0,0.3), 0 0 60px rgba(255,184,0,0.15)',
        'glow-subtle': '0 0 12px rgba(0,212,255,0.2)',
      },
      animation: {
        'pulse-lunar': 'pulse-lunar 2s ease-in-out infinite',
        'fade-in': 'fade-in 0.25s ease-out',
        'count-up': 'count-up 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)',
      },
      keyframes: {
        'pulse-lunar': {
          '0%, 100%': { boxShadow: '0 0 30px rgba(255,184,0,0.3), 0 0 60px rgba(255,184,0,0.15)' },
          '50%': { boxShadow: '0 0 40px rgba(255,184,0,0.5), 0 0 80px rgba(255,184,0,0.25)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'count-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      transitionDuration: {
        'fast': '150ms',
        'normal': '250ms',
        'slow': '400ms',
        'data': '600ms',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0.0, 0.2, 1)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
