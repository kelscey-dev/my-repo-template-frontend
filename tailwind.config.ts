import type { Config } from "tailwindcss";

const colors = require("./src/styles/theme.ts");

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontSize: {
        xs: [
          "0.75rem",
          {
            lineHeight: "normal",
          },
        ],
        sm: [
          "0.875rem",
          {
            lineHeight: "normal",
          },
        ],
        base: [
          "1rem",
          {
            lineHeight: "normal",
          },
        ],
        lg: [
          "1.125rem",
          {
            lineHeight: "normal",
          },
        ],
        xl: [
          "1.25rem",
          {
            lineHeight: "normal",
          },
        ],
        "2xl": [
          "1.5rem",
          {
            lineHeight: "normal",
          },
        ],
        "3xl": [
          "1.875rem",
          {
            lineHeight: "normal",
          },
        ],
        "4xl": [
          "2.25rem",
          {
            lineHeight: "normal",
          },
        ],
        "5xl": [
          "3rem",
          {
            lineHeight: "normal",
          },
        ],
      },
      fontFamily: {
        raleway: "var(--font-raleway)",
      },
      listStyleType: {
        none: "none",
        disc: "disc",
        decimal: "decimal",
        square: "square",
        roman: "upper-roman",
      },
      screens: {
        "3xl": "1920px",
        xs: "425px",
      },
      transitionDuration: {
        DEFAULT: "150ms",
      },
      transitionProperty: {
        width: "width",
      },
      borderColor: {
        DEFAULT: "#d9d9d9",
      },
      boxShadow: {
        DEFAULT: `0 .1rem .2rem 0 ${colors.standard.shadow}`,
        input: `0 0 .2rem 0 ${colors.standard.shadow}`,
      },
      colors,
    },
  },
  plugins: [],
};
export default config;
