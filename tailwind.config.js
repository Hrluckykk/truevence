/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.html',
    './src/**/*.js',
    './scripts/**/*.js',
    './public/**/*.html'
  ],
  theme: {
    extend: {
      colors: {
        ink:      '#0B1230',
        navy:     '#131B45',
        navylite: '#1E2A5E',
        violet:   '#7C3AED',
        violetlt: '#A78BFA',
        lavender: '#C9BEFB',
        paper:    '#F7F7FB',
        paperdim: '#EFEEF9',
        slate:    '#545A78',

        // Aliases for the `danger` classes used in two blog posts
        // (warning-signs-better-bgv-partner.html, how-to-choose-best-bgv-company-delhi-ncr.html)
        danger: {
          DEFAULT: '#DC2626',
          bg:      '#FEF2F2'
        }
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        body:    ['"Inter"', 'sans-serif'],
        mono:    ['"IBM Plex Mono"', 'monospace'],
        sans:    ['"Inter"', 'sans-serif']
      },
      // Custom screens — matches your existing responsive breakpoints in styles.css
      screens: {
        sm:  '640px',
        md:  '768px',
        lg:  '1024px',
        xl:  '1280px',
        '2xl': '1536px'
      },
      // Optional: keep the opacity scale used in your markup stable
      opacity: {
        8: '0.08',
        12: '0.12'
      }
    }
  },
  plugins: []
};
