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
        // Brand Primary Colors - Dark Green
        primary: {
          50: '#f0f9f4',
          100: '#dcf2e3',
          200: '#bce4cb',
          300: '#8bd1a7',
          400: '#54b67d',
          500: '#2d9f5c',
          600: '#1f7f47',
          700: '#196038',
          800: '#014421', // Main brand color
          900: '#0a3a1f',
        },
        // Brand Secondary Colors - Light Green
        secondary: {
          50: '#f8faf7',
          100: '#f2f6ef',
          200: '#e6eedc',
          300: '#D0D8C3', // Main secondary color
          400: '#b8c5a4',
          500: '#9eaf82',
          600: '#849763',
          700: '#6d7d4f',
          800: '#576340',
          900: '#475235',
        },
      },
      // Custom gradients
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #D0D8C3 0%, #ffffff 100%)',
        'brand-gradient-dark': 'linear-gradient(135deg, #1f2937 0%, #014421 100%)',
        'brand-radial': 'radial-gradient(ellipse at center, #D0D8C3 0%, #014421 100%)',
      },
      // Brand-only box shadows
      boxShadow: {
        'brand': '0 4px 14px 0 rgba(1, 68, 33, 0.1)',
        'brand-lg': '0 10px 25px 0 rgba(1, 68, 33, 0.15)',
        'brand-xl': '0 20px 40px 0 rgba(1, 68, 33, 0.08)',
        'secondary': '0 4px 14px 0 rgba(208, 216, 195, 0.2)',
        'secondary-lg': '0 10px 25px 0 rgba(208, 216, 195, 0.25)',
      }
    },
  },
  plugins: [],
};
