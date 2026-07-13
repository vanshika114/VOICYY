import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#185FA5',
        success: '#0F6E56',
        danger: '#A32D2D',
      },
    },
  },
  plugins: [],
}
export default config