import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
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
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        // Royal Indigo Primary Colors
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },

        // Royal Indigo Secondary Colors
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },

        // Destructive (Error)
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },

        // Muted colors
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },

        // Accent colors
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },

        // Popover colors
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },

        // Card colors
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // Sidebar colors
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },

        // ===== BLACKISH-BLUE THEME COLORS =====

        // Electric Blue Scale (Primary Brand Colors)
        "electric-blue": {
          50: "hsl(var(--electric-blue-50))",
          100: "hsl(var(--electric-blue-100))",
          200: "hsl(var(--electric-blue-200))",
          300: "hsl(var(--electric-blue-300))",
          400: "hsl(var(--electric-blue-400))",
          500: "hsl(var(--electric-blue-500))",
          600: "hsl(var(--electric-blue-600))",
          700: "hsl(var(--electric-blue-700))",
          800: "hsl(var(--electric-blue-800))",
          900: "hsl(var(--electric-blue-900))",
        },

        // Cyan Scale (Secondary Accents)
        cyan: {
          300: "hsl(var(--cyan-300))",
          400: "hsl(var(--cyan-400))",
          500: "hsl(var(--cyan-500))",
          600: "hsl(var(--cyan-600))",
          700: "hsl(var(--cyan-700))",
        },

        // Sky Blue Scale (Tertiary Accents)
        "sky-blue": {
          400: "hsl(var(--sky-blue-400))",
          500: "hsl(var(--sky-blue-500))",
          600: "hsl(var(--sky-blue-600))",
        },

        // Functional Colors
        success: {
          DEFAULT: "hsl(var(--success))",
          light: "hsl(var(--success-light))",
          dark: "hsl(var(--success-dark))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
        },
        error: {
          DEFAULT: "hsl(var(--error))",
          light: "hsl(var(--error-light))",
          dark: "hsl(var(--error-dark))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          light: "hsl(var(--info-light))",
          dark: "hsl(var(--info-dark))",
        },

        // Background variants
        "bg-secondary": "hsl(var(--background-secondary))",
        "bg-card": "hsl(var(--background-card))",
        "bg-elevated": "hsl(var(--background-elevated))",
        "bg-hover": "hsl(var(--background-hover))",

        // Text variants
        "text-secondary": "hsl(var(--foreground-secondary))",
        "text-muted": "hsl(var(--foreground-muted))",
        "text-disabled": "hsl(var(--foreground-disabled))",

        // Border variants
        "border-subtle": "hsl(var(--border-subtle))",
        "border-default": "hsl(var(--border-default))",
        "border-strong": "hsl(var(--border-strong))",
        "border-indigo": "hsl(var(--border-indigo))",
        "border-gold": "hsl(var(--border-gold))",
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
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "slide-in": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" }
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" }
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" }
        },

        // ===== BLACKISH-BLUE ANIMATIONS =====

        // Glow pulse animations
        "glow-pulse-blue": {
          "0%, 100%": { boxShadow: "var(--glow-blue-medium)" },
          "50%": { boxShadow: "var(--glow-blue-strong)" }
        },
        "glow-pulse-cyan": {
          "0%, 100%": { boxShadow: "var(--glow-cyan-subtle)" },
          "50%": { boxShadow: "var(--glow-cyan-medium)" }
        },
        "glow-pulse-premium": {
          "0%, 100%": { boxShadow: "var(--glow-premium)" },
          "50%": { boxShadow: "0 0 50px hsl(var(--cyan-500) / 0.6), 0 0 70px hsl(var(--electric-blue-500) / 0.3)" }
        },

        // Gradient animations
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" }
        },
        "gradient-blue-flow": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "25%": { backgroundPosition: "100% 0%" },
          "50%": { backgroundPosition: "100% 100%" },
          "75%": { backgroundPosition: "0% 100%" }
        },
        "gradient-premium-flow": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "33%": { backgroundPosition: "100% 0%" },
          "66%": { backgroundPosition: "100% 100%" }
        },

        // Shine effect for premium badges
        "shine": {
          "0%": { left: "-100%" },
          "100%": { left: "100%" }
        },

        // Hover effects
        "hover-lift": {
          "0%": { transform: "translateY(0)", boxShadow: "var(--shadow-md)" },
          "100%": { transform: "translateY(-4px)", boxShadow: "var(--shadow-blue-md)" }
        },
        "hover-glow-blue": {
          "0%": { boxShadow: "var(--shadow-md)" },
          "100%": { boxShadow: "var(--glow-blue-medium)" }
        },
        "hover-glow-cyan": {
          "0%": { boxShadow: "var(--shadow-md)" },
          "100%": { boxShadow: "var(--glow-cyan-subtle)" }
        },

        // Scale effects
        "scale-bounce": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" }
        },
        "scale-premium": {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(1.02) translateY(-2px)" }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "fade-in-up": "fade-in-up 0.6s ease-out",
        "slide-in": "slide-in 0.4s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
        "float": "float 3s ease-in-out infinite",

        // ===== BLACKISH-BLUE ANIMATIONS =====

        // Glow animations
        "glow-pulse-blue": "glow-pulse-blue 2s ease-in-out infinite",
        "glow-pulse-cyan": "glow-pulse-cyan 2s ease-in-out infinite",
        "glow-pulse-premium": "glow-pulse-premium 3s ease-in-out infinite",

        // Gradient animations
        "gradient-shift": "gradient-shift 3s ease infinite",
        "gradient-blue-flow": "gradient-blue-flow 6s ease infinite",
        "gradient-premium-flow": "gradient-premium-flow 8s ease infinite",

        // Shine effect
        "shine": "shine 3s infinite",

        // Hover effects
        "hover-lift": "hover-lift 0.3s ease-out",
        "hover-glow-blue": "hover-glow-blue 0.3s ease-out",
        "hover-glow-cyan": "hover-glow-cyan 0.3s ease-out",

        // Scale effects
        "scale-bounce": "scale-bounce 0.6s ease-in-out",
        "scale-premium": "scale-premium 0.3s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
