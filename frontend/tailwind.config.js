/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#4F6EF7',
        'primary-dark': '#3D56D4',
        accent: '#7C5CFC',
        bg: '#F5F6FA',
        card: '#FFFFFF',
        'text-primary': '#1A1A2E',
        'text-secondary': '#6B7280',
        'text-disabled': '#9CA3AF',
        'rare-ssr': '#F0B90B',
        'rare-sr': '#A855F7',
        'rare-r': '#3B82F6',
        'rare-n': '#9CA3AF',
      },
      borderRadius: {
        btn: '8px',
        card: '12px',
        modal: '16px',
        tag: '999px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.08)',
        float: '0 4px 12px rgba(0,0,0,0.1)',
        modal: '0 8px 32px rgba(0,0,0,0.15)',
      },
      transitionDuration: {
        fast: '150ms',
        normal: '250ms',
      },
    },
  },
  plugins: [],
}
