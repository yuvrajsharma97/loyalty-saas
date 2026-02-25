
module.exports = {
  darkMode: 'class',
  content: [
  "./pages/**/*.{js,ts,jsx,tsx,mdx}",
  "./components/**/*.{js,ts,jsx,tsx,mdx}",
  "./app/**/*.{js,ts,jsx,tsx,mdx}"],

  theme: {
    extend: {
      colors: {

        primary: "#014421",
        secondary: "#D0D8C3",


        text: {
          primary: "#014421",
          secondary: "#D0D8C3",
          muted: "#6B7280",
          light: "#9CA3AF",
          inverse: "#FFFFFF"
        },


        glass: {
          primary: "rgba(1, 68, 33, 0.15)",
          secondary: "rgba(208, 216, 195, 0.25)",
          white: "rgba(255, 255, 255, 0.25)",
          dark: "rgba(0, 0, 0, 0.15)"
        }
      },
      backdropBlur: {
        xs: "2px"
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out"
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" }
        }
      }
    }
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
    {
      dark: {

        primary: "#014421",
        "primary-focus": "#012f18",
        "primary-content": "#ffffff",


        secondary: "#D0D8C3",
        "secondary-focus": "#c4ceb5",
        "secondary-content": "#014421",


        neutral: "#27272a",
        "neutral-focus": "#18181b",
        "neutral-content": "#e4e4e7",


        "base-100": "#18181b",
        "base-200": "#27272a",
        "base-300": "#3f3f46",
        "base-content": "#e4e4e7",


        info: "#3abff8",
        success: "#36d399",
        warning: "#fbbd23",
        error: "#f87272",


        "--rounded-box": "1rem",
        "--rounded-btn": "0.5rem",
        "--rounded-badge": "1.9rem",
        "--animation-btn": "0.25s",
        "--animation-input": "0.2s",
        "--btn-text-case": "uppercase",
        "--btn-focus-scale": "0.95",
        "--border-btn": "1px",
        "--tab-border": "1px",
        "--tab-radius": "0.5rem"
      }
    }],

    base: true,
    styled: true,
    utils: true,
    prefix: "",
    logs: true,
    themeRoot: ":root"
  }
};