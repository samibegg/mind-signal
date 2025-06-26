module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class", // Enable dark mode using a class
  theme: {
    extend: {
      fontFamily: {
        // Define a custom font family for the terminal aesthetic
        mono: ['var(--font-plex-mono)', 'monospace'],
      },
      colors: {
        // Custom color palette for the cyber/military theme
        'brand-green': '#00ff41',
        'brand-light-green': '#6aff94',
        'dark-bg': '#0a0a0a',
        'dark-surface': '#1c1c1c',
        'dark-border': '#2e2e2e',
        'dark-text': '#d4d4d4',
        'dark-text-secondary': '#a3a3a3',
      },
      animation: {
        'scanline': 'scanline 10s linear infinite',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(0%)' },
          '100%': { transform: 'translateY(-100%)' },
        },
      }
    },
  },
  plugins: [],
};

