import type { Config } from 'tailwindcss'

export default <Config>{
  darkMode: 'class',
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue',
  ],
  theme: {
    extend: {
      colors: {
        'brand-aqua': '#00a19a',
        // #00a19a measures 3.2:1 for white/normal-size text against a
        // light background - fails WCAG 4.5:1. This is the same teal,
        // darkened until it passes (5.8:1) - use for any teal *text*
        // below large-text size (≥24px / ≥18.66px bold); '#00a19a' stays
        // fine for large text, icon fills and backgrounds under white
        // text. See the accessibility audit.
        'brand-aqua-text': '#00726c',
        'purple-main': '#7C3AED',
        'purple-light': 'var(--purple-main0)',
        'gray-dark': 'var(--gray-900)',
        'white-pure': 'var(--grays-white)',
        purplemain50: 'var(--purple-main500)',
        purplemain0: 'var(--purple-main0)',
      },
      fontFamily: {
        jakarta: ['Plus Jakarta Sans', 'sans-serif'],
        'sf-pro': [
          'SF Pro Display',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'sans-serif',
        ],
      },
      defaultFontFamily: {
        sans: [
          'SF Pro Display',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'sans-serif',
        ],
      },
      fontSize: {
        '12-regular': ['12px', { lineHeight: '15px', fontWeight: '400' }],
        '16-medium': ['16px', { lineHeight: '23px', fontWeight: '500' }],
        '17-medium': ['17px', { lineHeight: '23px', fontWeight: '500' }],
        '22-emphasized': [
          '22px',
          { lineHeight: '28px', fontWeight: '700', letterSpacing: '-0.26px' },
        ],
        '28-emphasized': [
          '28px',
          { lineHeight: '34px', fontWeight: '700', letterSpacing: '0.38px' },
        ],
      },
    },
  },
  plugins: [],
}
