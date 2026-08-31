/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/renderer/index.html",
    "./src/renderer/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        app: {
          bg: 'var(--bg)',
          panel: 'var(--panel)',
          border: 'var(--border)',
          'border-strong': 'var(--border-strong)',
          text: 'var(--text)',
          'text-2': 'var(--text-2)',
          'text-3': 'var(--text-3)',
          accent: 'var(--accent)',
          'accent-bg': 'var(--accent-bg)',
          toolbar: 'var(--toolbar)',
          live: 'var(--live)',
          'live-bg': 'var(--live-bg)',
        }
      }
    },
  },
  plugins: [],
}
