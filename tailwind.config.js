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
          bg: '#eef0f3',
          panel: '#ffffff',
          border: '#d7dbe1',
          'border-strong': '#b9c0ca',
          text: '#22262c',
          'text-2': '#5b6270',
          'text-3': '#9399a4',
          accent: '#2f6fed',
          'accent-bg': '#e8f0fe',
          toolbar: '#f6f7f9',
          live: '#d8352c',
          'live-bg': '#fdeceb',
        }
      }
    },
  },
  plugins: [],
}
