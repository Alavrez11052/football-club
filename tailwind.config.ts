import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        club: "var(--club-primary)",
        club2: "var(--club-secondary)",
      },
      fontFamily: {
        sans: ["var(--club-font)", "system-ui", "sans-serif"],
        display: ["var(--club-font-display)", "var(--club-font)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
