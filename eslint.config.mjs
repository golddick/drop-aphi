// eslint.config.js
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const compat = new FlatCompat({ baseDirectory: __dirname });

/** @type {import("eslint").Linter.FlatConfig[]} */
const eslintConfig = [
  // 1️⃣ Global ignore block — this MUST come before the rest
  {
    ignores: [
      "**/generated/**",
      "**/prisma/**",
      "**/lib/generated/prisma/**",
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },

  // 2️⃣ Extend Next.js + TypeScript base rules
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // 3️⃣ Custom rules for your source code
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
