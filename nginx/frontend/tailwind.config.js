/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      backgroundImage: {
        'cat-pong': "url('https://i.imgur.com/0w2jJxu.gif')",
      },
      fontFamily: {
        'press-start-2p': ['"Press Start 2P"', 'cursive'],
      },
    },
  },
  plugins: [],
};
