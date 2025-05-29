/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", 
  ],
  darkMode: 'class', 
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      animation: {
         modalShow: 'modalShow 0.3s forwards',
         tooltipShow: 'tooltipShow 0.2s forwards',
         fadeInUp: 'fadeInUp 0.7s ease-out forwards',
         fadeIn: 'fadeIn 0.5s ease-out forwards',
      },
      keyframes: {
        modalShow: { 
            '0%': { opacity: '0', transform: 'scale(0.95)' },
            '100%': { opacity: '1', transform: 'scale(1)' } 
        },
        tooltipShow: {
            '0%': { opacity: '0'},
            '100%': { opacity: '1'}
        },
        fadeInUp: {
            'from': { opacity: '0', transform: 'translateY(20px)' },
            'to': { opacity: '1', transform: 'translateY(0)' }
        },
        fadeIn: {
            'from': { opacity: '0', transform: 'translateY(10px)' },
            'to': { opacity: '1', transform: 'translateY(0)' }
        }
      },
      colors: {
        gray: { 
          850: '#161d2a', 
        }
      },
      maxWidth: { 
        'sm': '24rem', 'md': '28rem', 'lg': '32rem', 'xl': '36rem', 
        '2xl': '42rem', '3xl': '48rem', '4xl': '56rem'
      }
    },
  },
  plugins: [],
}
