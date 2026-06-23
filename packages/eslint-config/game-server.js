import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";
import globals from "globals";
import { config as baseConfig } from "./base.js";

/**
 * A custom ESLint configuration for the game-server.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const config = [
  ...baseConfig,
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    ignores: [
      // Default ignores:
      "logs/**",
      "dist/**",
      "node_modules/**",
      "out/**",
      "build/**",
      "custom.d.ts",
    ]
  },
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    rules: {
      "no-console": "off",
      '@typescript-eslint/naming-convention': [
        'error',
        // Convention for variables, parameters, functions (camelCase)
        {
          selector: ['variable', 'parameter', 'function'],
          format: ['camelCase'],
        },
        // Convention for class methods (camelCase)
        {
          selector: 'method',
          format: ['camelCase'],
        },
        // Convention for properties (camelCase)
        {
          selector: 'property',
          format: ['camelCase', 'snake_case'],
        },
        // Convention for classes, interfaces, types, enums (PascalCase)
        {
          selector: ['class', 'interface', 'typeAlias', 'enum', 'typeParameter'],
          format: ['PascalCase'],
        },
        // Convention for enum members (PascalCase)
        {
          selector: 'enumMember',
          format: ['PascalCase'],
        },
        // Allow leading underscore for unused parameters (common pattern)
        {
          selector: 'parameter',
          modifiers: ['unused'],
          format: ['camelCase'],
          leadingUnderscore: 'allow',
        },
        // Global constants (SCREAMING_SNAKE_CASE)
        {
          selector: 'variable',
          modifiers: ['global', 'const'],
          format: ['camelCase', 'UPPER_CASE'],
        },
        // For top‑level, exported constants you might want UPPER_CASE only
        {
          selector: 'variable',
          modifiers: ['exported', 'const'],
          format: ['UPPER_CASE', "cameCase"],
        },
      ],
    },
  },
];
