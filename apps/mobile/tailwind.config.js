/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./index.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT:       '#7C6AF7',
          dim:           '#5B4ED4',
          light:         '#9D8FFA',
          secondary:     '#34D399',
          couple:        '#F472B6',
          'couple-dim':  '#DB2777',
        },
        bg: {
          base:     '#0C0C14',
          surface:  '#161622',
          elevated: '#1E1E30',
          input:    '#1A1A28',
        },
        text: {
          primary:   '#F1F0FF',
          secondary: '#9896B0',
          muted:     '#5C5A74',
          inverse:   '#0C0C14',
        },
        income:  '#34D399',
        expense: '#F87171',
        warning: '#FBBF24',
        border: {
          DEFAULT: '#2A2A3E',
          focus:   '#7C6AF7',
          error:   '#F87171',
        },
      },
      borderRadius: {
        sm:   8,
        md:   12,
        lg:   16,
        xl:   20,
        '2xl': 24,
      },
    },
  },
  plugins: [],
};
