export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        taiko: {
          primary: "#E81899",
          bg: "#0C101B",
          card: "#1A1B23",
        },
      },
      fontFamily: {
        primary: ['"Clash Grotesk"', '"Public Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}