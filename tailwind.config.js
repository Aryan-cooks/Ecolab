/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        "primary": "#00FF41", // Matrix Green
        "secondary": "#F4A261", // Earth Amber
        "background": "#050505", // Deep Void
        "surface": "#121214", // Tech Grey
        "on-surface": "#D1D1D1",
        "outline": "#333333",
        "accent-blue": "#00F0FF",
        "alert-red": "#FF3131",
        "terminal-bg": "#000000",
        "neon-green": "#00FF41",
        "neon-green-dim": "#1a4d0f",
        "neon-amber": "#FFB100",
        "neon-red": "#FF3131",
        "matrix-dim": "#003B00",
        "outline-variant": "#00FF41",
        "midnight": "#050505",
        "surface-container": "#121212"
      },
      borderRadius: {
        "DEFAULT": "0px",
        "lg": "0px",
        "xl": "0px",
        "full": "9999px"
      },
      spacing: {
        "gutter": "24px",
        "margin-desktop": "32px",
        "space-4": "16px",
        "space-1": "4px",
        "max-width": "1400px",
        "space-6": "32px",
        "space-8": "48px",
        "space-2": "8px",
        "space-3": "12px",
        "space-5": "24px",
        "space-12": "64px"
      },
      fontFamily: {
        "label": ["JetBrains Mono", "monospace"],
        "body": ["JetBrains Mono", "monospace"],
        "display": ["JetBrains Mono", "monospace"],
        "h2": ["JetBrains Mono", "monospace"],
        "caption": ["JetBrains Mono", "monospace"],
        "mono-data": ["JetBrains Mono", "monospace"],
        "h3": ["JetBrains Mono", "monospace"],
        "h1": ["JetBrains Mono", "monospace"],
        "mono": ["JetBrains Mono", "monospace"]
      }
    },
  },
  plugins: [],
}
