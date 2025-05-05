// Example: /Users/user/Desktop/fireball-drop-ui/tailwind.config.js or .cjs
/** @type {import('tailwindcss').Config} */
module.exports = {
  // or export default for ESM (.js with "type": "module")
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Include all relevant file types in src
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
