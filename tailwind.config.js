/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js}",
    "./public/**/*.html"
  ],
  theme: {
    extend: {
      colors: {
        ink: '#0B1230',
        navy: '#131B45',
        navylite: '#1E2A5E',
        violet: '#7C3AED',
        violetlt: '#A78BFA',
        lavender: '#C9BEFB',
        paper: '#F7F7FB',
        paperdim: '#EFEEF9',
        slate: '#545A78',
        'slate-lt': '#8A8EA8',
        green: '#3bd39b',
        amber: '#febc2e',
        red: '#ff5f57'
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        'mono-ui': ['"IBM Plex Mono"', 'monospace']
      }
    }
  },
  plugins: []
};
