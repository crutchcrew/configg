import { configs as fmtConfigs } from '@configg/oxc/fmt'
import { antiSlop, configs as lintConfigs } from '@configg/oxc/lint'
import { defineConfig } from 'vite-plus'

// The vendored anti-slop source, and preset-test fixtures that are wrong on purpose
const ignorePatterns = [
	'packages/oxc/src/anti-slop/**',
	'packages/oxc/test/presets/fixtures/src/**',
]

export default defineConfig({
	// A called preset passes straight through, the same as a plain object
	fmt: fmtConfigs.scripts.with({ ignorePatterns }),
	lint: {
		extends: [lintConfigs.scripts, antiSlop],
		globals: { Bun: 'readonly' },
		ignorePatterns,
		overrides: [
			{
				// Rule code narrows AST nodes that are often absent: optional chaining and null are the natural fit
				files: ['packages/oxc/src/bun-test/**', 'packages/oxc/test/**'],
				rules: {
					'eslint/no-ternary': 'off',
					'eslint/no-undefined': 'off',
					'oxc/no-optional-chaining': 'off',
					'unicorn/no-null': 'off',
				},
			},
			{
				files: ['scripts/**'],
				rules: {
					'eslint/max-statements': 'off',
					'eslint/no-await-in-loop': 'off',
					'eslint/no-console': 'off',
					'eslint/no-ternary': 'off',
					'eslint/no-undefined': 'off',
					'oxc/no-optional-chaining': 'off',
					'unicorn/no-await-expression-member': 'off',
					'unicorn/no-null': 'off',
				},
			},
		],
	},
	test: {
		include: ['packages/*/test/**/*.spec.ts'],
	},
	staged: {
		'*': 'vp check --fix',
	},
})
