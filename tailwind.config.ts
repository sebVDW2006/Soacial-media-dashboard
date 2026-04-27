import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        oat: "#f4f0e8",
        leaf: "#20382f",
        moss: "#6c8d74",
        ember: "#b8613f",
        gold: "#dfb86c",
        blush: "#f5d7c8",
      },
      fontFamily: {
        display: ['"Avenir Next"', '"Futura PT"', "Futura", "sans-serif"],
        body: ['"Avenir Next"', '"Helvetica Neue"', "sans-serif"],
      },
      boxShadow: {
        float: "0 20px 50px rgba(32, 56, 47, 0.10)",
      },
    },
  },
  plugins: [],
} satisfies Config;

