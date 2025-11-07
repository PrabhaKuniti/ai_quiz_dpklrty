import defaultTheme from 'tailwindcss/defaultTheme'

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        display: ['Poppins', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        brand: {
          DEFAULT: '#2563eb',
          dark: '#1d4ed8',
          light: '#60a5fa',
        },
      },
      boxShadow: {
        soft: '0 24px 60px -20px rgba(15, 23, 42, 0.3)',
      },
      backgroundImage: {
        'mesh-gradient': 'radial-gradient(110% 110% at 15% 20%, rgba(59,130,246,0.15) 0%, rgba(99,102,241,0.15) 35%, rgba(14,116,144,0.1) 70%, rgba(15,23,42,0.0) 100%)',
      },
    },
  },
  plugins: [],
}

