/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "inverse-on-surface": "#f2f2d9",
        "inverse-primary": "#a1d494",
        "on-primary-container": "#9dd090",
        "primary-fixed": "#bcf0ae",
        "on-tertiary-fixed-variant": "#802918",
        "secondary": "#944925",
        "tertiary-fixed-dim": "#ffb4a5",
        "secondary-container": "#fe9e72",
        "on-primary-fixed": "#002201",
        "on-error": "#ffffff",
        "on-secondary-fixed-variant": "#76320f",
        "inverse-surface": "#303221",
        "outline-variant": "#c2c9bb",
        "on-surface": "#1b1d0e",
        "on-error-container": "#93000a",
        "error": "#ba1a1a",
        "tertiary": "#6e1c0c",
        "surface-tint": "#3b6934",
        "secondary-fixed": "#ffdbcd",
        "error-container": "#ffdad6",
        "surface-dim": "#dbdcc3",
        "primary-container": "#2d5a27",
        "on-background": "#1b1d0e",
        "tertiary-fixed": "#ffdad3",
        "on-surface-variant": "#42493e",
        "on-tertiary": "#ffffff",
        "secondary-fixed-dim": "#ffb596",
        "surface-container-low": "#f5f5dc",
        "tertiary-container": "#8d3220",
        "on-primary": "#ffffff",
        "surface-bright": "#fbfbe2",
        "surface-container": "#efefd7",
        "on-primary-fixed-variant": "#23501e",
        "primary-fixed-dim": "#a1d494",
        "background": "#fbfbe2",
        "surface": "#fbfbe2",
        "on-tertiary-container": "#ffaf9e",
        "on-secondary": "#ffffff",
        "surface-container-lowest": "#ffffff",
        "on-secondary-fixed": "#360f00",
        "on-tertiary-fixed": "#3e0500",
        "surface-variant": "#e4e4cc",
        "primary": "#154212",
        "on-secondary-container": "#773310",
        "surface-container-high": "#eaead1",
        "surface-container-highest": "#e4e4cc",
        "outline": "#72796e"
      },
      borderRadius: {
        "DEFAULT": "0.125rem",
        "lg": "0.25rem",
        "xl": "0.5rem",
        "full": "0.75rem"
      },
      fontFamily: {
        "headline": ["Plus Jakarta Sans", "sans-serif"],
        "body": ["Manrope", "sans-serif"],
        "label": ["Manrope", "sans-serif"],
        "chewy": ["Chewy", "cursive"],
        "sora": ["Sora", "sans-serif"]
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ],
}
