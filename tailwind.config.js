/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        lavender: "#C8A2C8",
        "sky-blue": "#87CEEB",
        "mint-green": "#98FF98",
        "soft-yellow": "#FFFACD",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
