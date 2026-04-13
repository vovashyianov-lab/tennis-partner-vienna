/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Tennis Partner Vienna green palette
        tennis: {
          50:  '#f0f7ec',
          100: '#dcefd2',
          200: '#b9dfaa',
          300: '#8dca76',
          400: '#6abf5e',
          500: '#4a8c3f',
          600: '#2d5a27',
          700: '#1a3a1a',
          800: '#122a12',
          900: '#0a1a0a',
        },
        // Page background
        bg: '#a8c490',
      },
      fontFamily: {
        heading: ['"Fredoka One"', 'cursive'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Domine', 'Georgia', 'serif'],
      },
      borderRadius: {
        xl: '16px',
      },
      backdropBlur: {
        card: '16px',
      },
    },
  },
  plugins: [],
};
