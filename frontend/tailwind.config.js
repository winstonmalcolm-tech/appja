/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
   
    extend: {
      colors: {
        "custom-purple": "#cf70db",
        "off-purple": "#8d5afb"
      },
    },
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    base: false
  }
}

