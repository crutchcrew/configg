import { defineConfig } from 'oxlint'
import { configs } from '@configg/oxc/lint'

export default defineConfig({
	...configs.scripts,
	globals: { Bun: 'readonly' },
	overrides: [
		{
			files: ['scripts/**'],
			rules: {
				'eslint/max-statements': 'off',
				'eslint/no-await-in-loop': 'off',
				'eslint/no-console': 'off',
				'eslint/no-continue': 'off',
				'eslint/no-ternary': 'off',
				'eslint/no-undefined': 'off',
				'oxc/no-async-await': 'off',
				'oxc/no-optional-chaining': 'off',
				'unicorn/import-style': 'off',
				'unicorn/no-await-expression-member': 'off',
				'unicorn/no-null': 'off',
			},
		},
	],
})
