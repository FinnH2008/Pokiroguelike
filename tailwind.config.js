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
          dark: '#1a1a1c',
          panel: '#ffffff',
          hp: {
            green: '#34c759', // Apple standard green
            yellow: '#ffcc00', // Apple standard yellow
            red: '#ff3b30', // Apple standard red
          }
        }
      },
      fontFamily: {
        retro: ['"Press Start 2P"', 'cursive'],
        sans: ['"Inter"', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-pressed': '0 2px 10px 0 rgba(0, 0, 0, 0.2)',
      }
    },
  },
  plugins: [],
}
