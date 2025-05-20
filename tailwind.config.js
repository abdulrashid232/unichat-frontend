/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#3B82F6", 
          dark: "#2563EB", 
          light: "#60A5FA",
        },
        secondary: {
          DEFAULT: "#6366F1",
          dark: "#4F46E5",
          light: "#818CF8",
        },
        accent: {
          DEFAULT: "#8B5CF6",
          dark: "#7C3AED",
          light: "#A78BFA",
        },
      },
      fontFamily: {
        sans: ["Inter var", "sans-serif"],
      },
    },
  },
  plugins: [],
};
