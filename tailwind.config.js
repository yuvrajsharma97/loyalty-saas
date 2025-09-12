module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#014421",
        secondary: "#D0D8C3",
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        loyaltyos: {
          primary: "#014421",
          secondary: "#D0D8C3",
          accent: "#37CDBE",
          neutral: "#3D4451",
          "base-100": "#FFFFFF",
          "base-200": "#F7F8FA",
          "base-300": "#E5E7EB",
          info: "#3ABFF8",
          success: "#36D399",
          warning: "#FBBD23",
          error: "#F87272",
        },
      },
      "light",
      "dark",
    ],
    darkTheme: "dark",
  },
};
