import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";
import pluginRouter from '@tanstack/eslint-plugin-router'
import pluginQuery from '@tanstack/eslint-plugin-query'

export default defineConfig([
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"], plugins: { js }, extends: ["js/recommended"] },
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"], languageOptions: { globals: globals.browser } },
  tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  pluginRouter.configs.flat.recommended,
  pluginQuery.configs.flat.recommended,
  {
    rules: {
        '@tanstack/router/create-route-property-order': 'error',
        semi: 'error',
        'react-compiler/react-compiler': 'error',
        'no-empty-interface': 'error',
        'no-use-before-define': 'error',
    },
  },
]);