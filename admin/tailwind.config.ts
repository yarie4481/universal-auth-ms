import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#07131c",
          900: "#0b1f2c",
          800: "#123247",
          700: "#1a455f",
          600: "#25607f",
        },
        mist: {
          50: "#f3f7f9",
          100: "#e7eef3",
          200: "#d0dde6",
        },
        accent: {
          DEFAULT: "#0f8a7a",
          soft: "#d8f3ee",
          dark: "#0a5f54",
        },
        warn: {
          DEFAULT: "#b45309",
          soft: "#fff7ed",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        panel: "0 18px 50px -28px rgba(7, 19, 28, 0.45)",
      },
      backgroundImage: {
        "grid-mist":
          "linear-gradient(to right, rgba(18,50,71,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(18,50,71,0.06) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "28px 28px",
      },
    },
  },
  plugins: [],
};

export default config;
