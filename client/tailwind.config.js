import defaultTheme from 'tailwindcss/defaultTheme';

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a',
          900: '#14532d',
        },
        secondary: {
          50: '#f0f9ff',
          500: '#0ea5e9',
          600: '#0284c7',
          900: '#0c2340',
        },
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in': 'slide-in 0.5s ease-out',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 0 0 rgba(34, 197, 94, 0.7)' },
          '50%': { opacity: '0.8', boxShadow: '0 0 0 10px rgba(34, 197, 94, 0)' },
        },
        'slide-in': {
          'from': { transform: 'translateX(-100%)', opacity: '0' },
          'to': { transform: 'translateX(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
