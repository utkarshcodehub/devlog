export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['Epilogue', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        bg: '#F9F7F3',
        card: '#FFFFFF',
        ink: '#0D0D0D',
        muted: '#6B6B6B',
        accent: '#E8400C',
        border: '#E2DFD8',
      },
    },
  },
  plugins: [],
}
