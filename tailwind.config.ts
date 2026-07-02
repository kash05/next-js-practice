import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

/**
 * Tailwind config — semantic naming layer only.
 * All actual values live in globals.css as CSS variables.
 * This file maps those variable names to Tailwind utility classes.
 */
const config: Config = {
  darkMode: "class",

  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],

  theme: {
    // ── Override container ───────────────────────────────────────────────────
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },

    extend: {
      colors: {
        // Backgrounds
        bg: {
          page: "var(--color-bg-page)",
          subtle: "var(--color-bg-subtle)",
          muted: "var(--color-bg-muted)",
        },

        // Surfaces
        surface: {
          base: "var(--color-surface-base)",
          raised: "var(--color-surface-raised)",
          overlay: "var(--color-surface-overlay)",
        },

        // Primary
        primary: {
          DEFAULT: "var(--color-primary)",
          hover: "var(--color-primary-hover)",
          active: "var(--color-primary-active)",
          subtle: "var(--color-primary-subtle)",
          fg: "var(--color-primary-fg)",
        },

        // Secondary
        secondary: {
          DEFAULT: "var(--color-secondary)",
          hover: "var(--color-secondary-hover)",
          fg: "var(--color-secondary-fg)",
        },

        // Text
        text: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
          tertiary: "var(--color-text-tertiary)",
          disabled: "var(--color-text-disabled)",
          inverse: "var(--color-text-inverse)",
          brand: "var(--color-text-brand)",
          danger: "var(--color-text-danger)",
        },

        // Borders
        border: {
          DEFAULT: "var(--color-border-default)",
          subtle: "var(--color-border-subtle)",
          strong: "var(--color-border-strong)",
          focus: "var(--color-border-focus)",
          danger: "var(--color-border-danger)",
        },

        // Input
        input: {
          bg: "var(--color-input-bg)",
          border: "var(--color-input-border)",
          "border-hover": "var(--color-input-border-hover)",
          "border-focus": "var(--color-input-border-focus)",
          placeholder: "var(--color-input-placeholder)",
        },

        // Status — success
        success: {
          bg: "var(--color-success-bg)",
          subtle: "var(--color-success-subtle)",
          DEFAULT: "var(--color-success)",
          bold: "var(--color-success-bold)",
          fg: "var(--color-success-fg)",
          text: "var(--color-success-text)",
        },

        // Status — warning
        warning: {
          bg: "var(--color-warning-bg)",
          subtle: "var(--color-warning-subtle)",
          DEFAULT: "var(--color-warning)",
          bold: "var(--color-warning-bold)",
          fg: "var(--color-warning-fg)",
          text: "var(--color-warning-text)",
        },

        // Status — error / destructive
        error: {
          bg: "var(--color-error-bg)",
          subtle: "var(--color-error-subtle)",
          DEFAULT: "var(--color-error)",
          bold: "var(--color-error-bold)",
          fg: "var(--color-error-fg)",
          text: "var(--color-error-text)",
        },
        destructive: {
          DEFAULT: "var(--color-error)",
          fg: "var(--color-error-fg)",
        },

        // Status — info
        info: {
          bg: "var(--color-info-bg)",
          subtle: "var(--color-info-subtle)",
          DEFAULT: "var(--color-info)",
          bold: "var(--color-info-bold)",
          fg: "var(--color-info-fg)",
          text: "var(--color-info-text)",
        },

        // Sidebar
        sidebar: {
          DEFAULT: "var(--color-sidebar-bg)",
          fg: "var(--color-sidebar-fg)",
          border: "var(--color-sidebar-border)",
          "item-hover": "var(--color-sidebar-item-hover-bg)",
          "item-active": "var(--color-sidebar-item-active-bg)",
          "item-active-fg": "var(--color-sidebar-item-active-fg)",
          "item-fg": "var(--color-sidebar-item-fg)",
          "muted-fg": "var(--color-sidebar-muted-fg)",
        },

        // shadcn/ui compatibility aliases
        background: "var(--color-bg-page)",
        foreground: "var(--color-text-primary)",
        muted: {
          DEFAULT: "var(--color-bg-subtle)",
          foreground: "var(--color-text-tertiary)",
        },
        accent: {
          DEFAULT: "var(--color-bg-muted)",
          foreground: "var(--color-text-secondary)",
        },
        card: {
          DEFAULT: "var(--color-surface-base)",
          foreground: "var(--color-text-primary)",
        },
        popover: {
          DEFAULT: "var(--color-surface-raised)",
          foreground: "var(--color-text-primary)",
        },
        ring: "var(--color-border-focus)",
      },

      // ── Border radius ───────────────────────────────────────────────────────
      borderRadius: {
        xs: "var(--radius-xs)",
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
        full: "var(--radius-full)",
      },

      // ── Box shadows ─────────────────────────────────────────────────────────
      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
      },

      // ── Font families ───────────────────────────────────────────────────────
      fontFamily: {
        sans: ["var(--font-sans)", ...defaultTheme.fontFamily.sans],
        mono: ["var(--font-mono)", ...defaultTheme.fontFamily.mono],
      },

      // ── Z-index ─────────────────────────────────────────────────────────────
      zIndex: {
        base: "0",
        raised: "10",
        dropdown: "100",
        sticky: "200",
        overlay: "300",
        modal: "400",
        toast: "500",
        tooltip: "600",
      },

      // ── Animations ──────────────────────────────────────────────────────────
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "spin-slow": {
          to: { transform: "rotate(360deg)" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-out": {
          from: { opacity: "1", transform: "translateY(0)" },
          to: { opacity: "0", transform: "translateY(4px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "spin-slow": "spin-slow 2s linear infinite",
        "fade-in": "fade-in 0.15s ease-out",
        "fade-out": "fade-out 0.15s ease-in",
      },
    },
  },

  plugins: [require("@tailwindcss/typography")],
};

export default config;
