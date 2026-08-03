/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#05070d',
          900: '#0a0e17',
          850: '#0d1220',
          800: '#111827',
          700: '#1a2333',
          600: '#243044',
          500: '#334155',
        },
        accent: {
          400: '#5eead4',
          500: '#2dd4bf',
          600: '#14b8a6',
        },
        signal: {
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(45,212,191,0.15), 0 8px 30px -8px rgba(45,212,191,0.25)',
      },
      backgroundImage: {
        grid: "linear-gradient(to right, rgba(148,163,184,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.06) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: '32px 32px',
      },
    },
  },
  plugins: [],
}
