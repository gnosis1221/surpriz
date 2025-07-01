/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'dancing': ['Dancing Script', 'cursive'],
        'poppins': ['Poppins', 'sans-serif'],
      },
      colors: {
        'romantic': {
          50: '#fef7ff',
          100: '#feeffe',
          200: '#fce7fe',
          300: '#f9d7fe',
          400: '#f3b8fd',
          500: '#e879f9',
          600: '#d946ef',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
        }
      },
      animation: {
        'heartbeat': 'heartbeat 1.5s ease-in-out infinite',
        'fade-in': 'fade-in 1s ease-out',
      }
    },
  },
  plugins: [],
};