module.exports = {
  mode: "jit",
  purge: ["./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: false, // or 'media' or 'class',

  theme: {
    fontFamily: {
      display: ['"Press Start 2P"'],
      body: ['"VT323", monospace'],
      "sans-serif": ["VT323"],
    },

    extend: {
      width: {
        "7xl": "80rem",
      },
      lineHeight: {
        "rn-1": "calc( 1em - 1px )",
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
      boxShadow: (theme) => {
        const green = theme("colors")["rn-green-dark"];
        const red = theme("colors")["rn-red-dark"];
        const orange = theme("colors")["rn-orange-dark"];
        const purple = theme("colors")["rn-purple-dark"];
        const grey = theme("colors")["rn-grey-dark"];
        const getShadow = (color) => `7px 7px 0 ${color},
        6px 6px 0 ${color},
        5px 5px 0 ${color}, 
        4px 4px 0 ${color},
        3px 3px 0 ${color},
        2px 2px 0 ${color},
        1px 1px 0 ${color}`;
        return {
          "rn-drop-green": getShadow(green),
          "rn-drop-red": getShadow(red),
          "rn-drop-orange": getShadow(orange),
          "rn-drop-purple": getShadow(purple),
          "rn-drop-grey": getShadow(grey),
          "rn-drop-black": getShadow("black"),
          "rn-inset-orange": `inset 3px 3px 0 ${orange}`,
          "rn-one": "7px 7px 0 black",
          "rn-one-purple": `7px 7px 0 ${purple}`,
          "rn-one-white": `7px 7px 0 white`,
        };
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require("@tailwindcss/aspect-ratio")],
};
