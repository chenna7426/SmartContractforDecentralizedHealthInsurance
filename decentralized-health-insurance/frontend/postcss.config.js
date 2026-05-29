module.exports = {
  plugins: [
    require("tailwindcss")({
      content: ["./src/**/*.{js,jsx,ts,tsx}"],
      theme: {
        extend: {},
      },
      plugins: [],
    }),
    require("autoprefixer"),
  ],
};
