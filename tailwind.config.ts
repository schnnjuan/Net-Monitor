import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--bg)",
        foreground: "var(--text-primary)",
        shutdown: {
          DEFAULT: "var(--shutdown)",
          bg: "var(--shutdown-bg)",
          border: "var(--shutdown-border)",
        },
        attack: {
          DEFAULT: "var(--attack)",
          bg: "var(--attack-bg)",
          border: "var(--attack-border)",
        },
        censorship: {
          DEFAULT: "var(--censorship)",
          bg: "var(--censorship-bg)",
          border: "var(--censorship-border)",
        },
        throttling: {
          DEFAULT: "var(--throttling)",
          bg: "var(--throttling-bg)",
          border: "var(--throttling-border)",
        },
        normal: {
          DEFAULT: "var(--normal)",
          bg: "var(--normal-bg)",
        },
        border: "var(--border)",
        muted: "var(--text-muted)",
      },
      fontFamily: {
        mono: ["var(--font-mono)", "monospace"],
      },
      animation: {
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
