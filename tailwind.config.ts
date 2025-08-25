import type { Config } from 'tailwindcss'

export default <Config>{
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
        'purple-main': 'var(--purple-main500)',
        'purple-light': 'var(--purple-main0)',
        'gray-dark': 'var(--gray-900)',
        'white-pure': 'var(--grays-white)',
      },
      fontFamily: {
        jakarta: ['Plus Jakarta Sans', 'sans-serif'],
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
