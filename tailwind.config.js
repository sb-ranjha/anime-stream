/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
  // Add custom styles to base layer
  corePlugins: {
    // Disable default scrollbar styles
    scrollbar: false
  },
  // Add custom utilities
  variants: {
    scrollbar: ['rounded']
  },
  // Add custom CSS
  layer: {
    utilities: {
      '.no-scrollbar': {
        /* IE and Edge */
        '-ms-overflow-style': 'none',
        /* Firefox */
        'scrollbar-width': 'none',
        /* Safari and Chrome */
        '&::-webkit-scrollbar': {
          display: 'none'
        }
      }
    }
  }
};
