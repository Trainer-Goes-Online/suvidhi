/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand palette — anchored to #CB4A5D (600) with #963543 hover (700)
        brand: {
          50: '#fdf3f4',
          100: '#fbe7ea',
          200: '#f5c8ce',
          300: '#ec9ea9',
          400: '#de6976',
          500: '#d05a6d',
          600: '#CB4A5D', // primary brand
          700: '#963543', // hover
          800: '#7c2d39',
          900: '#5d2129',
          950: '#391218',
        },
        accent: {
          50: '#fffaeb',
          100: '#fff1c6',
          200: '#ffe188',
          300: '#ffca4a',
          400: '#ffb01f',
          500: '#f98e07',
          600: '#dd6802',
          700: '#b74706',
          800: '#94370c',
          900: '#7a2e0d',
        },
        ink: {
          50: '#f8f7f7',
          100: '#efeded',
          200: '#dcd8d8',
          300: '#bcb5b5',
          400: '#948a8a',
          500: '#766c6c',
          600: '#615757',
          700: '#4e4747',
          800: '#403a3a',
          900: '#211e1e',
          950: '#110f0f',
        },
        cream: {
          DEFAULT: '#fdfaf8',
          dark: '#f7f1ee',
        },
      },
      fontFamily: {
        display: ['"Sora"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['"Inter Tight"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        script: ['"Pacifico"', 'cursive'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(57,18,24,.04), 0 6px 24px -8px rgba(57,18,24,.08)',
        elev: '0 10px 30px -12px rgba(57,18,24,.18), 0 4px 10px -6px rgba(57,18,24,.08)',
        glow: '0 0 0 1px rgba(203,74,93,.22), 0 18px 60px -20px rgba(203,74,93,.45)',
        ring: '0 0 0 6px rgba(203,74,93,.10)',
      },
      backgroundImage: {
        'grain': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.06 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        'mesh': 'radial-gradient(60% 50% at 50% 0%, rgba(236,158,169,.30) 0%, transparent 60%), radial-gradient(40% 40% at 100% 100%, rgba(255,202,74,.18) 0%, transparent 60%), radial-gradient(40% 40% at 0% 100%, rgba(203,74,93,.10) 0%, transparent 60%)',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        pulseRing: {
          '0%': { transform: 'scale(.7)', opacity: '0.6' },
          '80%, 100%': { transform: 'scale(1.6)', opacity: '0' },
        },
        floaty: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shine: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        breathe: {
          '0%,100%': { opacity: '0.55' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        marquee: 'marquee 38s linear infinite',
        pulseRing: 'pulseRing 2.2s cubic-bezier(0.215,0.61,0.355,1) infinite',
        floaty: 'floaty 4.5s ease-in-out infinite',
        shine: 'shine 2.8s linear infinite',
        breathe: 'breathe 3.5s ease-in-out infinite',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'out-back': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
}
