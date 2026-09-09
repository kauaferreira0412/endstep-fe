export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {

        bg: {
          DEFAULT: "#1a1a2e",
          soft: "#232343",
          elev: "#2e2e56",
          input: "#15152a",
        },
        line: {
          DEFAULT: "#3d3d6c",
          soft: "#2f2f54",
        },
        ink: {
          DEFAULT: "#eceaf6",
          dim: "#aca7ca",
          faint: "#7d78a2",
        },

        brand: {
          DEFAULT: "#a78bfa",
          hover: "#bba4fc",
          soft: "#3a3268",
        },

        gold: {
          DEFAULT: "#f0c869",
          soft: "#463a24",
        },
        ok: "#4ade9c",
        warn: "#e8a13d",
        danger: "#f87090",

        mana: {
          w: "#f4eedb",
          u: "#5b9bd8",
          b: "#6d6d80",
          r: "#e05a4f",
          g: "#54b273",
          c: "#b6b2ca",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      borderRadius: {
        xl: "0.875rem",
      },
      boxShadow: {
        card: "inset 0 1px 0 rgba(255,255,255,.04), 0 1px 2px rgba(0,0,0,.35), 0 18px 40px -22px rgba(20,16,45,.75)",
        pop: "0 22px 60px -18px rgba(10,8,30,.7)",
        glow: "0 0 0 1px rgba(167,139,250,.35), 0 0 24px -4px rgba(167,139,250,.45)",
      },
      keyframes: {
        "fade-in": { from: { opacity: 0 }, to: { opacity: 1 } },
        "slide-in": {
          from: { transform: "translateX(16px)", opacity: 0 },
          to: { transform: "translateX(0)", opacity: 1 },
        },
      },
      animation: {
        "fade-in": "fade-in .15s ease-out",
        "slide-in": "slide-in .18s ease-out",
      },
    },
  },
  plugins: [],
};
