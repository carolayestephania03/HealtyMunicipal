/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        petroleum: {
          DEFAULT: '#005f73',
          dark: '#023e4a',
          light: '#0a7a93',
          muted: '#e6f2f4',
        },
      },
      fontSize: {
        'app-sm': ['15px', { lineHeight: '22px' }],
        'app-base': ['17px', { lineHeight: '26px' }],
        'app-lg': ['20px', { lineHeight: '28px' }],
        'app-xl': ['24px', { lineHeight: '32px' }],
        'app-2xl': ['30px', { lineHeight: '38px' }],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(15 23 42 / 0.06)',
      },
    },
  },
  plugins: [],
};
