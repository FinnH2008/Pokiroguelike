/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ds: {
          dark: '#282828',
          panel: '#f8f8f8',
          hp: {
            green: '#18c020',
            yellow: '#f8d030',
            red: '#f85838',
          }
        }
      },
      fontFamily: {
        retro: ['"Press Start 2P"', 'cursive'],
      },
      boxShadow: {
        ds: 'inset -4px -4px 0px 0px rgba(0,0,0,0.2), inset 4px 4px 0px 0px rgba(255,255,255,0.7)',
        'ds-pressed': 'inset 4px 4px 0px 0px rgba(0,0,0,0.2)',
      }
    },
  },
  plugins: [],
}
