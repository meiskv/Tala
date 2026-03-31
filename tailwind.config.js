/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        people: "#4FC3F7",
        actions: "#81C784",
        food: "#FFB74D",
        places: "#CE93D8",
        feelings: "#EF5350",
        descriptors: "#FFD54F",
      },
    },
  },
  plugins: [],
};
