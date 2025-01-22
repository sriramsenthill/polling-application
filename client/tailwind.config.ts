import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'custom-gradient': 'linear-gradient(to bottom, #c9edde, #d1e4fa)',
      },
      colors: {
        'custom-gray': '#55525d',
        'custom-pink': '#e36492',
        'button-primary': '#e36492',
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        satoshi: ['Satoshi', 'Helvetica Neue', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;