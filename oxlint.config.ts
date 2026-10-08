import { defineConfig } from 'oxlint'
import { antiSlop, configs } from '@configg/oxc/lint'

export default defineConfig({
	...configs.scripts,
	globals: { Bun: 'readonly' },
	ignorePatterns: ['packages/oxc/src/anti-slop/**'],
	jsPlugins: [...antiSlop.jsPlugins],
	overrides: [
		{
			files: ['scripts/**'],
			rules: {
				'eslint/max-statements': 'off',
				'eslint/no-await-in-loop': 'off',
				'eslint/no-console': 'off',
				'eslint/no-ternary': 'off',
				'eslint/no-undefined': 'off',
				'oxc/no-optional-chaining': 'off',
				'unicorn/import-style': 'off',
				'unicorn/no-await-expression-member': 'off',
				'unicorn/no-null': 'off',
			},
		},
	],
	rules: { ...configs.scripts.rules, ...antiSlop.rules },
})
