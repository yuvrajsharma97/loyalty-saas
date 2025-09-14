module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/daisyui/dist/**/*.js",
    "./node_modules/daisyui/src/**/*.{js,ts}",
  ],
  safelist: [
    // Button classes
    'btn', 'btn-primary', 'btn-secondary', 'btn-accent', 'btn-ghost', 'btn-outline',
    'btn-xs', 'btn-sm', 'btn-md', 'btn-lg', 'btn-wide', 'btn-block', 'btn-circle', 'btn-square',
    'btn-disabled', 'btn-active', 'btn-success', 'btn-warning', 'btn-error', 'btn-info',
    // Card classes
    'card', 'card-body', 'card-title', 'card-actions', 'card-compact', 'card-normal',
    // Modal classes
    'modal', 'modal-box', 'modal-action', 'modal-open', 'modal-backdrop',
    // Glass effect
    'glass', 'backdrop-blur-sm', 'backdrop-blur-md', 'backdrop-blur-lg',
    // Form classes
    'input', 'input-bordered', 'input-primary', 'input-secondary', 'input-accent',
    'input-success', 'input-warning', 'input-error', 'input-info',
    'select', 'select-bordered', 'select-primary', 'select-secondary',
    'textarea', 'textarea-bordered', 'textarea-primary',
    // Layout classes
    'navbar', 'navbar-start', 'navbar-center', 'navbar-end',
    'dropdown', 'dropdown-content', 'dropdown-open',
    'menu', 'menu-item', 'menu-title',
    'divider', 'divider-horizontal', 'divider-vertical',
    // Alert classes
    'alert', 'alert-success', 'alert-warning', 'alert-error', 'alert-info',
    // Badge classes
    'badge', 'badge-primary', 'badge-secondary', 'badge-accent',
    // Loading classes
    'loading', 'loading-spinner', 'loading-dots', 'loading-ring', 'loading-ball',
    // Theme classes
    'theme-loyaltyos'
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
    rtl: false,
    prefix: "",
    logs: true,
  },
};
