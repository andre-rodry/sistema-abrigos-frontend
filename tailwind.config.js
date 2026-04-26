/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0891B2',
        secondary: '#0F766E',
        danger: '#DC2626',
        success: '#059669',
        warning: '#D97706',
      },
    },
  },
  plugins: [],
}