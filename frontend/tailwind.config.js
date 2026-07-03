/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          950: '#030303',
          900: '#06060c',
          800: '#0b0c16',
          700: '#111326',
          600: '#1b1d3a',
          500: '#2c2f5d',
        },
        neon: {
          indigo: '#6366f1',
          cyan: '#06b6d4',
          emerald: '#10b981',
          rose: '#f43f5e',
          violet: '#8b5cf6',
          fuchsia: '#d946ef'
        }
      },
      backgroundImage: {
        'cosmic-grid': "radial-gradient(circle, rgba(99,102,241,0.08) 1px, transparent 1px), radial-gradient(circle, rgba(6,182,212,0.08) 1px, transparent 1px)",
        'neon-glow': "radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.15) 0%, rgba(0,0,0,0) 80%)"
      },
      backgroundSize: {
        'grid-size': '24px 24px'
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'neon-cyan': '0 0 15px rgba(6, 182, 212, 0.4)',
        'neon-indigo': '0 0 15px rgba(99, 102, 241, 0.4)',
        'neon-emerald': '0 0 15px rgba(16, 185, 129, 0.4)',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}
