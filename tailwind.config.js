/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#EF4444',
        dark: '#0F0F0F',
        secondary: '#1A1A1A',
        accent: '#2A2A2A',
        gray: {
          750: '#2D3748'
        }
      }
    },
  },
  plugins: [],
}
