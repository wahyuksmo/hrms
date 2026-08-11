/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./resources/**/*.blade.php",
    "./resources/**/*.jsx",
    "./resources/**/*.js",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb', // Primary Professional Blue
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        corporate: {
          slate: '#0F172A',
          card: '#FFFFFF',
          sidebar: '#1E293B',
          header: '#FFFFFF',
          accent: '#2563eb'
        },
        boxdark: '#24303F',
        'boxdark-2': '#1A222C',
        strokedark: '#2E3A47',
        whiten: '#F1F5F9',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 8px 30px rgba(0, 0, 0, 0.03)',
        'soft-hover': '0 12px 40px rgba(0, 0, 0, 0.06)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
}
