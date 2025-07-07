/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f3f8f3',
          100: '#e6f1e6',
          200: '#c1e0c1',
          300: '#9bcf9b',
          400: '#51ad51',
          500: '#2e7d32', // Main primary color
          600: '#297129',
          700: '#235e23',
          800: '#1d4b1d',
          900: '#173d17',
        },
        secondary: {
          50: '#f7fcf7',
          100: '#eff9ef',
          200: '#d7f0d7',
          300: '#bfe7bf',
          400: '#8fd58f',
          500: '#4caf50', // Secondary color
          600: '#449e48',
          700: '#38833c',
          800: '#2c6930',
          900: '#245527',
        },
        eco: {
          green: '#4caf50',
          sage: '#9ccc65',
          forest: '#2e7d32',
          mint: '#81c784',
        },
      },
      fontFamily: {
        sans: ['Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        eco: '12px',
      },
      boxShadow: {
        eco: '0 2px 8px rgba(0,0,0,0.1)',
        'eco-hover': '0 4px 16px rgba(0,0,0,0.15)',
      },
      backgroundImage: {
        'eco-gradient': 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
      },
    },
  },
  plugins: [],
};
