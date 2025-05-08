/** @type {import('tailwindcss').Config} */

module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        "blue-dark": {
          DEFAULT: "#040A25",
          100: "#060F37",
          200: "#081449"
        },
        "blue-light": {
          DEFAULT: "#DAE0FB",
          100: "#B6C2F7",
          200: "#889CF2",
          300: "#bfdbfe"
        },
        "orange-neon": "#F98824"
      },
      fontFamily: {
        "lato-regular": ["Lato-Regular", "sans-serif"],
        "lato-black": ["Lato-Black", "sans-serif"],
        "lato-bold": ["Lato-Bold", "sans-serif"],
        "lato-light": ["Lato-Light", "sans-serif"],
        "lato-thin": ["Lato-Thin", "sans-serif"]
      }
    },
  },
  darkMode: "class",
  plugins: [],
}