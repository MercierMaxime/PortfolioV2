module.exports = {
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
        "colors": {
         "Noir": "#000000",
         "Blanc": "#ffffff"
        },
        "fontSize": {
         "base": "0.9375rem",
         "lg": "1.25rem",
         "xl": "1.5rem",
         "2xl": "2rem",
         "3xl": "4rem",
         "4xl": "6rem"
        },
        "fontFamily": {
         "sublima": "Sublima"
        },
        "borderRadius": {
         "none": "0",
         "xs": "0.1875rem",
         "sm": "0.625rem",
         "default": "1.25rem",
         "lg": "1.875rem"
        },
        keyframes: {
          animate:{
            '0%,10%,100%':{
              width:'0%'
            },
            '70%,80%,90%':{
              width:'20%'
            },
          }
        }
    },
    animation: {
      animate:'animate 4s linear infinite',
    }
    },
  variants: {
    extend: {},
  },
  plugins: [],
}