/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          primary: '#0a0a0b',
          secondary: '#111113',
          tertiary: '#18181b',
          elevated: '#1f1f23',
        },
        border: {
          subtle: '#27272a',
          active: '#3f3f46',
        },
        content: {
          primary: '#fafafa',
          secondary: '#a1a1aa',
          muted: '#71717a',
        },
        accent: {
          primary: '#22d3ee',
          secondary: '#06b6d4',
        },
      },
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
