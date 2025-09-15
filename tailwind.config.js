/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors mapped to DaisyUI semantic colors
        primary: "#014421", // Dark green
        secondary: "#D0D8C3", // Light sage

        // Enhanced text color palette
        text: {
          primary: "#014421",    // Main brand text
          secondary: "#2D5A3D",  // Lighter brand text
          muted: "#6B7280",      // Muted text
          light: "#9CA3AF",      // Light text
          inverse: "#FFFFFF",    // White text for dark backgrounds
        },

        // Glass effect colors
        glass: {
          primary: "rgba(1, 68, 33, 0.15)",
          secondary: "rgba(208, 216, 195, 0.25)",
          white: "rgba(255, 255, 255, 0.25)",
          dark: "rgba(0, 0, 0, 0.15)",
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        loyalty: {
          // Primary colors (dark green)
          primary: "#014421",
          "primary-focus": "#012f18",
          "primary-content": "#ffffff",

          // Secondary colors (light sage)
          secondary: "#D0D8C3",
          "secondary-focus": "#c4ceb5",
          "secondary-content": "#014421",

          // Neutral colors for text and backgrounds
          neutral: "#2a2e37",
          "neutral-focus": "#16181d",
          "neutral-content": "#ffffff",

          // Base colors for backgrounds
          "base-100": "#ffffff",
          "base-200": "#f9fafb",
          "base-300": "#f3f4f6",
          "base-content": "#1f2937",

          // State colors
          info: "#3abff8",
          success: "#36d399",
          warning: "#fbbd23",
          error: "#f87272",

          // Glass effect variables
          "--rounded-box": "1rem",
          "--rounded-btn": "0.5rem",
          "--rounded-badge": "1.9rem",
          "--animation-btn": "0.25s",
          "--animation-input": "0.2s",
          "--btn-text-case": "uppercase",
          "--btn-focus-scale": "0.95",
          "--border-btn": "1px",
          "--tab-border": "1px",
          "--tab-radius": "0.5rem",
        },
      },
    ],
    base: true,
    styled: true,
    utils: true,
    prefix: "",
    logs: true,
    themeRoot: ":root",
  },
};
