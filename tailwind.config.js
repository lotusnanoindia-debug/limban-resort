/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  // Add safelist for wellness page colors
  safelist: [
    // Rose colors (spa treatments)
    "text-rose-300",
    "text-rose-400",
    "text-rose-700",
    "text-rose-400/60",
    "bg-rose-400",
    "bg-rose-900",
    "bg-rose-900/20",
    "bg-rose-700/60",
    "border-rose-400",
    "border-rose-400/20",
    "border-rose-400/30",
    "border-rose-400/40",
    "from-rose-300",
    "via-rose-400",
    "to-rose-400",
    "from-rose-400/10",
    "via-pink-500/10",
    "to-rose-400/10",
    "from-rose-400/20",
    "to-pink-500/20",

    // Pink colors (spa treatments)
    "text-pink-400",
    "text-pink-500",
    "via-pink-400",
    "bg-pink-900/20",

    // Cyan colors (wellness activities)
    "text-cyan-300",
    "text-cyan-400",
    "text-cyan-400/60",
    "bg-cyan-400",
    "bg-cyan-400/10",
    "bg-cyan-400/20",
    "border-cyan-400",
    "border-cyan-400/20",
    "border-cyan-400/30",
    "from-cyan-300",
    "via-cyan-400",
    "to-cyan-400",
    "from-cyan-400/10",
    "via-teal-500/10",
    "to-cyan-400/10",

    // Teal colors (wellness activities)
    "text-teal-400",
    "text-teal-500",
    "via-teal-400",
    "to-teal-500/20",
    "bg-teal-500/20",

    // Additional wellness gradients and effects
    "from-emerald-300",
    "via-teal-400",
    "to-cyan-400",
    "from-emerald-400/10",
    "via-teal-500/10",
    "to-emerald-400/10",
    "hover:text-rose-400",
    "hover:text-cyan-400",
    "group-hover:text-cyan-400",
    "hover:border-rose-400/40",
    "hover:border-cyan-400/30",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Your existing custom grays
        gray: {
          50: "#FAFAFA",
          100: "#F4F4F5",
          200: "#E4E4E7",
          300: "#D4D4D8",
          400: "#A1A1AA",
          500: "#71717A",
          600: "#52525B",
          700: "#3F3F46",
          800: "#27272A",
          900: "#18181B",
          950: "#09090B",
        },
        // Shadcn colors
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
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      // Your existing animations
      animation: {
        "fade-in": "fadeIn 0.8s ease-in-out",
        "slide-up": "slideUp 0.6s ease-out",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      fontFamily: {
        sans: ["Arial", "system-ui", "-apple-system", "sans-serif"],
        serif: ["Playfair", "Georgia", "serif"],
        display: ["Playfair", "Georgia", "serif"],
      },
      dropShadow: {
        "dark-lg": [
          "0 10px 8px rgb(0 0 0 / 0.6)",
          "0 4px 3px rgb(0 0 0 / 0.25)",
        ],
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/forms")],
};
