import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: {
      js,
      import: importPlugin,
    },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.browser },
    settings: {
      "import/resolver": {
        exports: true,
        node: {
          extensions: [".js", ".mjs", ".cjs"],
        },
      },
    },

    rules: {
      // Import/Export rules - catch missing files and wrong paths
      "import/no-unresolved": "error",
      "import/named": "error",
      "import/default": "error",
      "import/namespace": "error",
      "import/no-absolute-path": "error",
      "import/no-dynamic-require": "error",
      "import/no-self-import": "error",
      "import/no-useless-path-segments": "error",
      "import/extensions": ["error", "always", { ignorePackages: true }],
      // Semicolons - REQUIRED
      semi: ["error", "always"],
      "semi-spacing": ["error", { before: false, after: true }],

      // Unused variables should error
      "no-unused-vars": ["error", { vars: "all", args: "after-used" }],

      // Quotes - consistent style
      quotes: ["error", "double", { avoidEscape: true }],

      // Indentation - 2 spaces
      // "indent": ["error", 2, { "SwitchCase": 1 }],

      // Equality - always use === and !==
      eqeqeq: ["error", "always"],

      // Curly braces - always required
      curly: ["error", "all"],

      // Modern JavaScript
      "no-var": "error",
      "prefer-const": "error",

      // Spacing and formatting
      "space-before-function-paren": [
        "error",
        {
          anonymous: "always",
          named: "never",
          asyncArrow: "always",
        },
      ],
      "comma-dangle": ["error", "never"],
      "object-curly-spacing": ["error", "always"],
      "array-bracket-spacing": ["error", "never"],
      "keyword-spacing": ["error", { before: true, after: true }],

      // Best practices
      "no-console": "warn",
      "no-debugger": "error",
      "no-duplicate-imports": "error",
      // "no-multiple-empty-lines": ["error", { "max": 1 }],
      "eol-last": ["error", "always"],
    },
  },
]);
