/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#3B82F6", // blue-500
          dark: "#2563EB", // blue-600
          light: "#60A5FA", // blue-400
        },
        secondary: {
          DEFAULT: "#6366F1", // indigo-500
          dark: "#4F46E5", // indigo-600
          light: "#818CF8", // indigo-400
        },
        accent: {
          DEFAULT: "#8B5CF6", // violet-500
          dark: "#7C3AED", // violet-600
          light: "#A78BFA", // violet-400
        },
      },
      fontFamily: {
        sans: ["Inter var", "sans-serif"],
      },
    },
  },
  plugins: [],
};
