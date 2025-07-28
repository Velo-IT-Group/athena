import pluginQuery from '@tanstack/eslint-plugin-query';
import pluginRouter from '@tanstack/eslint-plugin-router';
import eslint from '@eslint/js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import tseslint from 'typescript-eslint';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
	baseDirectory: __dirname,
	allConfig: {
		rules: {
			semi: 'error',
			'no-empty-interface': 'error',
			'no-use-before-define': 'error',
			'@typescript-eslint/no-unused-vars': 'warn',
			'no-unused-vars': 'warn',
			'@typescript-eslint/ban-ts-comment': 'warn',
		},
		plugins: {
			'@tanstack/query': pluginQuery,
			'@tanstack/router': pluginRouter,
		},
	},
	recommendedConfig: {
		rules: {
			semi: 'error',
			'no-empty-interface': 'error',
			'no-use-before-define': 'error',
			// '@typescript-eslint/no-unused-vars': 'warn',
			'no-unused-vars': 'warn',
			// '@typescript-eslint/ban-ts-comment': 'warn',
		},
		plugins: ['@tanstack/query', '@tanstack/router'],
	},
});

const eslintConfig = [
	...compat.extends('eslint:recommended'),
	// ...eslint.configs.all,
	// ...tseslint.configs.strict,
	// ...tseslint.configs.stylistic,
	// ...pluginQuery.configs['flat/recommended'],
	// ...pluginRouter.configs['flat/recommended'],
];

export default eslintConfig;

// export default tseslint.config(
// 	// eslint.configs.recommended,
// 	// tseslint.configs.strict,
// 	// tseslint.configs.stylistic,
// 	// pluginQuery.configs.recommended,
// 	// pluginRouter.configs.recommended
// 	compat.extends('next/typescript')
// );
