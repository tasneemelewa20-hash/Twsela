/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#07213d',
          dark: '#05182d',
          light: '#0c2d54',
          accent: '#103966',
        },
        twsela: {
          blue: '#1358a5',
          'blue-light': '#1a70d8',
          teal: '#00c48c',
          'teal-dark': '#00a376',
          gold: '#f5a623',
          warn: '#f59e0b',
          danger: '#e5373a',
          purple: '#7c3aed',
          bg: '#f0f3f8',
          surf: '#ffffff',
          surf2: '#f7f8fb',
          surf3: '#edf0f5',
          border: 'rgba(10,45,80,0.09)',
          border2: 'rgba(10,45,80,0.16)',
          text: '#0a1929',
          muted: '#4a6080',
          muted2: '#7a92a6',
        }
      },
      fontFamily: {
        arabic: ['"IBM Plex Sans Arabic"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      }
    },
  },
  plugins: [],
}
