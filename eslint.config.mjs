import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const config = [
  {
    // Must be its own object — cannot be merged with rules
    ignores: [".next/**", "node_modules/**", "dist/**", "*.config.js"],
  },

  // Next.js core rules (React, React Hooks, Next.js specific)
  ...compat.extends("next/core-web-vitals"),

  // TypeScript rules
  ...compat.extends("plugin:@typescript-eslint/recommended"),

  // Prettier — disables ESLint rules that conflict with formatting (always last)
  ...compat.extends("prettier"),

  {
    rules: {
      // ── TypeScript ────────────────────────────────────────────────────────
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-non-null-assertion": "warn",
      // Note: consistent-type-imports omitted — conflicts with Next.js auto-imports

      // ── React ──────────────────────────────────────────────────────────────
      "react/self-closing-comp": "error",
      "react/jsx-curly-brace-presence": ["error", { props: "never", children: "never" }],

      // ── General ────────────────────────────────────────────────────────────
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-const": "error",
      "no-var": "error",
      "object-shorthand": "error",
      "no-duplicate-imports": "error",
    },
  },

  {
    // Relax rules in config files
    files: ["**/*.config.ts", "**/*.config.mjs"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "no-console": "off",
    },
  },
];

export default config;
