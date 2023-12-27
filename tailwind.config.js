const {addDynamicIconSelectors} = require('@iconify/tailwind');
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./packages/renderer/src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: [
    'light',
    'dark',
    'cupcake',
    'bumblebee',
    'emerald',
    'corporate',
    'synthwave',
    'retro',
    'cyberpunk',
    'valentine',
    'halloween',
    'garden',
    'forest',
    'aqua',
    'lofi',
    'pastel',
    'fantasy',
    'wireframe',
    'black',
    'luxury',
    'dracula',
    'cmyk',
    'autumn',
    'business',
    'acid',
    'lemonade',
    'night',
    'coffee',
    'winter',
    'dim',
    'nord',
    'sunset',
  ],
  plugins: [
    require('daisyui'),
    addDynamicIconSelectors({
      prefix: 'i',
    }),
  ],
};
