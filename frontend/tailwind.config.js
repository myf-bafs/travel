/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        korea: {
          blue: "#003472",
          red: "#CD2E3A",
          gold: "#D4A843",
          navy: "#1a1a2e",
          cream: "#FFF8E7",
          gray: "#F5F5F5",
        },
      },
      fontFamily: {
        sans: [
          '"Noto Sans TC"',
          '"Noto Sans KR"',
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
