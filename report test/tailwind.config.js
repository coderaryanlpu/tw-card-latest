/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",      
    "./pages/**/*.{js,ts,jsx,tsx}",    
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: 'media', // ⚡ Follow system light/dark mode
  theme: {
    extend: {
      colors: {
        brandGreen: "#22c55e",
      },
      maxWidth: {
        '550': '550px',
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
  ],
};
