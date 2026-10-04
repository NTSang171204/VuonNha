/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1B5E20',
          dark: '#144617',
          hover: '#2E7D32',
          container: '#1B5E20',
        },
        secondary: {
          DEFAULT: '#006e1c',
          container: '#91f78e',
        },
        surface: {
          DEFAULT: '#F4F6F4',
          card: '#FFFFFF',
          low: '#edf6e7',
          container: '#e8f1e1',
        },
        ink: {
          DEFAULT: '#1F2937',
          secondary: '#4B5563',
          muted: '#9CA3AF',
        },
        line: {
          DEFAULT: '#E8ECE8',
          control: '#E0E0E0',
        },
        status: {
          pending: { bg: '#FEF3C7', border: '#FDE68A', text: '#B45309' },
          processing: { bg: '#EFF6FF', border: '#BFDBFE', text: '#1D4ED8' },
          delivering: { bg: '#F3E8FF', border: '#E9D5FF', text: '#7E22CE' },
          completed: { bg: '#ECFDF5', border: '#A7F3D0', text: '#047857' },
          cancelled: { bg: '#FEF2F2', border: '#FECACA', text: '#B91C1C' },
        },
        error: '#ba1a1a',
      },
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        panel: '0 4px 12px -2px rgba(31, 41, 55, 0.08)',
        modal: '0 12px 28px -4px rgba(31, 41, 55, 0.14)',
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
};
