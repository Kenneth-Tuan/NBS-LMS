import { defineConfig, presetUno } from "unocss";
import transformerDirectives from "@unocss/transformer-directives";

export default defineConfig({
  rules: [
    [
      /^text-(.*)$/,
      ([, c], { theme }) => {
        if (theme.colors[c]) return { color: theme.colors[c] };
      },
    ],
  ],
  theme: {
    colors: {
      primary: {
        DEFAULT: "#dec690",
        light: "#e8d5a8",
        dark: "#c7ae78",
        50: "#faf7ed",
        100: "#f5efdb",
        200: "#ebdfb7",
        300: "#dec690",
        400: "#c7ae78",
        500: "#b09660",
      },
      secondary: {
        DEFAULT: "#6b7280",
        light: "#9ca3af",
        dark: "#4b5563",
        50: "#f9fafb",
        100: "#f3f4f6",
        200: "#e5e7eb",
        300: "#d1d5db",
        400: "#9ca3af",
        500: "#6b7280",
      },
      blue: {
        DEFAULT: "#264073",
        light: "#0000FF",
      },
      accent: {
        DEFAULT: "#8b5cf6",
        light: "#a78bfa",
        dark: "#7c3aed",
      },
      success: {
        DEFAULT: "#10b981",
        light: "#34d399",
        dark: "#059669",
      },
      warning: {
        DEFAULT: "#f59e0b",
        light: "#fbbf24",
        dark: "#d97706",
      },
      error: {
        DEFAULT: "#ef4444",
        light: "#f87171",
        dark: "#dc2626",
      },
    },
    fontFamily: {},
    breakpoints: {
      sm: "320px",
      md: "640px",
      lg: "991px",
      xl: "1280px",
      "2xl": "1440px",
      "3xl": "1920px",
    },
    verticalBreakpoints: {},
    boxShadow: {
      "gls-base": "0px 10px 10px 0px rgba(0, 0, 0, 0.05)",
    },
  },
  shortcuts: [
    // you could still have object style
    {
      btn: "py-2 px-4 font-semibold rounded-lg shadow-md",
    },
  ],
  variants: [
    // hover:
    (matcher) => {
      if (!matcher.startsWith("hover:")) return matcher;
      return {
        // slice `hover:` prefix and passed to the next variants and rules
        matcher: matcher.slice(6),
        selector: (s) => `${s}:hover`,
      };
    },
  ],
  preflights: [],
  layers: {
    components: -1,
    default: 1,
    utilities: 2,
    "my-layer": 3,
  },
  presets: [presetUno({ prefix: "u-" })],
  transformers: [transformerDirectives()],
});
