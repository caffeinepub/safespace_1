/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        lavender: {
          50: "oklch(var(--lavender-50))",
          100: "oklch(var(--lavender-100))",
          200: "oklch(var(--lavender-200))",
          300: "oklch(var(--lavender-300))",
          400: "oklch(var(--lavender-400))",
          500: "oklch(var(--lavender-500))",
          600: "oklch(var(--lavender-600))",
          700: "oklch(var(--lavender-700))",
          800: "oklch(var(--lavender-800))",
          900: "oklch(var(--lavender-900))",
          950: "oklch(var(--lavender-950))",
        },
        blush: {
          50: "oklch(var(--blush-50))",
          100: "oklch(var(--blush-100))",
          200: "oklch(var(--blush-200))",
          300: "oklch(var(--blush-300))",
          400: "oklch(var(--blush-400))",
          500: "oklch(var(--blush-500))",
          600: "oklch(var(--blush-600))",
          700: "oklch(var(--blush-700))",
          800: "oklch(var(--blush-800))",
          900: "oklch(var(--blush-900))",
          950: "oklch(var(--blush-950))",
        },
        sky: {
          50: "oklch(var(--sky-50))",
          100: "oklch(var(--sky-100))",
          200: "oklch(var(--sky-200))",
          300: "oklch(var(--sky-300))",
          400: "oklch(var(--sky-400))",
          500: "oklch(var(--sky-500))",
          600: "oklch(var(--sky-600))",
          700: "oklch(var(--sky-700))",
          800: "oklch(var(--sky-800))",
          900: "oklch(var(--sky-900))",
          950: "oklch(var(--sky-950))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};
