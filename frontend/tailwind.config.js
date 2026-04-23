/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx,html}'],
  theme: {
    extend: {
      colors: {
        soil: {
          50: '#fdf8f3', 100: '#f5e9d8', 200: '#e8ccaa', 300: '#d4a574',
          400: '#c08040', 500: '#a66228', 600: '#8a4e1e', 700: '#6e3c18',
          800: '#522c12', 900: '#3a1e0c',
        },
        crop: {
          50: '#f0fdf0', 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac',
          400: '#4ade80', 500: '#22c55e', 600: '#16a34a', 700: '#15803d',
          800: '#166534', 900: '#14532d',
        },
        harvest: {
          50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d',
          400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body:    ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        field: '0 2px 8px 0 rgba(60,40,12,0.10)',
        'field-hover': '0 8px 24px 0 rgba(60,40,12,0.16)',
      },
    },
  },
  plugins: [],
}