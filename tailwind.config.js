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
          bg: '#1e1e1e',
          panel: '#2d2d2d',
          border: '#3e3e42',
          'border-strong': '#505054',
          text: '#ffffff',
          'text-2': '#bbbbbb',
          'text-3': '#888888',
          accent: '#2b73d2',
          'accent-bg': '#1b4985',
          toolbar: '#252526',
          live: '#d8352c',
          'live-bg': '#3f1917',
        }
      }
    },
  },
  plugins: [],
}
