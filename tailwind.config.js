module.exports = {
  mode: "jit",
  purge: ["./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: false, // or 'media' or 'class',

  theme: {
    fontFamily: {
      display: ['"Press Start 2P"'],
      body: ["VT323"],
      "sans-serif": ["VT323"],
    },

    extend: {
      width: {
        "7xl": "80rem",
      },
      colors: {
        "rn-orange": "#ff9800",
        "rn-orange-dark": "#ef6c00",
        "rn-purple": "#9966cc",
        "rn-purple-dark": "#6a3a95",
        "rn-green": "#33c8a1",
        "rn-green-dark": "#26957c",
        "rn-grey-light": "#eee6f6",
        "rn-grey": "#b4b4b4",
        "rn-grey-dark": "#9a9a9a",
        "rn-red": "#f14c4c",
        "rn-red-dark": "#d82020",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
