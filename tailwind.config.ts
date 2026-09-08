import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#07090e",
        foreground: "#f3f4f6",
        obsidian: {
          950: "#040508",
          900: "#07090e",
          850: "#0c0f17",
          800: "#111622",
          750: "#161e2e",
          700: "#1c263a",
          600: "#273550",
          500: "#384a6e",
          400: "#60749e",
        },
        flame: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
        },
        ember: {
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626",
        },
        solar: {
          400: "#facc15",
          500: "#eab308",
        },
        emerald: {
          400: "#34d399",
          500: "#10b981",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        "glow-flame": "0 0 25px -5px rgba(249, 115, 22, 0.25)",
        "glow-ember": "0 0 25px -5px rgba(239, 68, 68, 0.25)",
        "glow-subtle": "0 0 30px -10px rgba(255, 255, 255, 0.05)",
      },
      animation: {
        "pulse-subtle": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "ping-slow": "ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite",
      },
    },
  },
  plugins: [],
};
export default config;
