/** @type {import('tailwindcss').Config} */
export default {
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
