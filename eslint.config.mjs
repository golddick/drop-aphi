import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const compat = new FlatCompat({ baseDirectory: __dirname });

/** @type {import("eslint").Linter.FlatConfig[]} */
const eslintConfig = [
  {
    // ✅ Tell ESLint to ignore Prisma generated files (not delete or skip them)
    ignores: [
      "**/lib/generated/prisma/**",
      "**/generated/**",
      "**/prisma/**",
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },

  // ✅ Use recommended base configs
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // ✅ Your custom rules
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-require-imports": "off",
    },
  },
];

export default eslintConfig;
