/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/ts/ui/**/*.{ts,tsx}", "./index.html"],
  theme: {
    colors: {
      white: "#ffffff",
      black: "#000000",
      primary: "#00FFC6",
      "scenario-clicking": "#BA253C",
      "scenario-tracking": "#246AD2",
      "scenario-switching": "#881ABB",
    },
    extend: {},
  },
  plugins: [],
};
