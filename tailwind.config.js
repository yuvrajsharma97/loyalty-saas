module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/daisyui/dist/**/*.js",
  ],
  safelist: [
    'btn',
    'btn-primary',
    'btn-secondary',
    'btn-accent',
    'btn-ghost',
    'btn-outline',
    'card',
    'card-body',
    'card-title',
    'card-actions',
    'modal',
    'modal-box',
    'modal-action',
    'navbar',
    'dropdown',
    'menu'
  ],
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
      "light",
      "dark",
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
    ],
    darkTheme: "dark",
    base: true,
    styled: true,
    utils: true,
  },
};
