import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        heading: ['var(--font-poppins)', 'system-ui', 'sans-serif'],
      },
      colors: {
        accent: "#3b82f6",
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "float-slow": "float 9s ease-in-out infinite",
        "float-fast": "float 4s ease-in-out infinite",
        glow: "glow 3s ease-in-out infinite",
        "wa-pulse": "wa-pulse 2.4s ease-out infinite",
      },
      keyframes: {
        "wa-pulse": {
          "0%": { transform: "scale(1)", opacity: "0.6" },
          "70%": { transform: "scale(1.7)", opacity: "0" },
          "100%": { transform: "scale(1.7)", opacity: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px) translateX(0px)" },
          "33%": { transform: "translateY(-20px) translateX(8px)" },
          "66%": { transform: "translateY(-10px) translateX(-8px)" },
        },
        glow: {
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "0.7" },
        },
      },
      backgroundImage: {
        "hero-glow":
          "radial-gradient(ellipse 70% 60% at 60% 0%, rgba(59,130,246,0.12), transparent)",
        "contact-glow":
          "radial-gradient(ellipse at bottom center, rgba(59,130,246,0.06), transparent)",
        "stats-glow":
          "radial-gradient(ellipse at center, rgba(59,130,246,0.05), transparent)",
      },
      boxShadow: {
        "glow-blue": "0 0 40px -8px rgba(59,130,246,0.5)",
        "glow-blue-sm": "0 0 20px -5px rgba(59,130,246,0.35)",
        card: "0 1px 0 rgba(255,255,255,0.05), 0 4px 32px rgba(0,0,0,0.4)",
      },
    },
  },
  plugins: [],
}

export default config
