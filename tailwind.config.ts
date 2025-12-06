import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        botanero: {
          primary: "#FF6B35",
          "primary-light": "#FFE5DC",
          secondary: "#F7931E",
          "secondary-light": "#FFF4E6",
          accent: "#FFD23F",
          dark: "#2C1810",
          "dark-light": "#4A3428",
          wood: "#8B4513",
          "wood-light": "#D4A574",
          neon: "#00FF88",
          warm: "#FF8C42",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;

