/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        red: {
          500: '#FF161F',
          600: '#CC111A',
          700: '#9E0D14',
        },
        gov: {
          red:        '#FF161F',
          blue:       '#034EA2',
          navy:       '#233254',
          'blue-mid': '#4297D3',
          'blue-light':'#62C9E0',
          green:      '#0B9247',
          olive:      '#94AA5A',
          black:      '#1D1D1B',
          bar:        '#1a1a1a',
          gray:       '#F8F9FB',
          'gray-mid': '#E8EAF0',
          'gray-dark':'#808080',
        },
      },
      fontFamily: {
        sans:        ['Verdana', 'Geneva', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'sans-serif'],
        montserrat:  ['Montserrat', 'Verdana', 'sans-serif'],
      },
      boxShadow: {
        'card':       '0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.08), 0 16px 40px rgba(0,0,0,0.07)',
      },
    },
  },
  plugins: [],
};
