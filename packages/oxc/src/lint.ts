import type { OxlintConfig } from 'oxlint'

const antiSlopPlugin = { name: 'anti-slop', specifier: `${import.meta.dirname}/anti-slop/index.ts` }

const sharedRules = {
	'eslint/id-length': 'off',
	'eslint/max-classes-per-file': ['warn', { max: 2 }],
	'eslint/max-lines-per-function': ['warn', { max: 100, skipBlankLines: true, skipComments: true }],
	'eslint/max-statements': ['warn', { max: 30 }],
	'import/prefer-default-export': 'off',
	'oxc/no-async-await': 'off',
	'typescript/restrict-template-expressions': [
		'error',
		{
			allowBoolean: true,
			allowNever: true,
			allowNullish: true,
			allowNumber: true,
		},
	],
	'unicorn/no-array-reduce': 'off',
	'unicorn/no-process-exit': 'off',
	// Oxfmt and Prettier write hex digits in lowercase; this rule wants uppercase and takes no option.
	'unicorn/number-literal-case': 'off',
} as const satisfies OxlintConfig['rules']

/** Opt in by spreading into a preset. The plugin ships as TypeScript, so run oxlint under Bun. */
export const antiSlop = {
	jsPlugins: [antiSlopPlugin],
	rules: {
		'anti-slop/no-array-filter-map': 'error',
		'anti-slop/no-chained-type-assertions': 'error',
		'anti-slop/no-conditional-empty-object-spread': 'error',
		'anti-slop/no-known-value-widening': 'error',
		'anti-slop/no-module-mocking': 'error',
		'anti-slop/no-object-parameters': 'error',
		'anti-slop/no-reduce-accumulator-copy': 'error',
		'anti-slop/no-reflect-apply': 'error',
		'anti-slop/no-reflect-get': 'error',
		'anti-slop/no-runtime-typeof': 'error',
		'anti-slop/no-shape-in-symbol-names': 'error',
		'anti-slop/no-unknown-parameters': 'error',
		'anti-slop/no-unknown-returns': 'error',
		'anti-slop/no-unknown-type-aliases': 'error',
		'anti-slop/no-unsafe-dictionary-type': 'error',
		'anti-slop/no-widen-then-assert': 'error',
		'anti-slop/require-readable-spacing': 'error',
		'anti-slop/require-safety-comment-for-type-assertion': 'error',
		// This pushes toward Reflect.apply, which anti-slop/no-reflect-apply forbids.
		'unicorn/prefer-reflect-apply': 'off',
	},
} as const satisfies OxlintConfig

export const configs = {
	client: {
		categories: {
			correctness: 'error',
			nursery: 'warn',
			pedantic: 'warn',
			perf: 'error',
			restriction: 'error',
			style: 'warn',
			suspicious: 'warn',
		},
		env: {
			browser: true,
			builtin: true,
		},
		options: {
			typeAware: true,
			typeCheck: true,
		},
		overrides: [
			{
				env: {
					vitest: true,
				},
				files: ['**/*.spec.{ts,tsx}'],
				jsPlugins: ['eslint-plugin-testing-library'],
				plugins: ['eslint', 'oxc', 'react', 'typescript', 'unicorn', 'vitest'],
				rules: {
					'max-lines-per-function': 'off',
					'no-async-await': 'off',
					'no-restricted-imports': [
						'error',
						{
							paths: [
								{
									importNames: ['fireEvent'],
									message:
										'Use `@testing-library/user-event` instead — it dispatches the full sequence of events a real user triggers, where `fireEvent` only dispatches a single DOM event.',
									name: '@testing-library/react',
								},
							],
						},
					],
					'testing-library/await-async-events': ['error', { eventModule: 'userEvent' }],
					'testing-library/await-async-queries': 'error',
					'testing-library/await-async-utils': 'error',
					'testing-library/no-await-sync-events': ['error', { eventModules: ['fire-event'] }],
					'testing-library/no-await-sync-queries': 'error',
					'testing-library/no-container': 'error',
					'testing-library/no-debugging-utils': 'warn',
					'testing-library/no-dom-import': ['error', 'react'],
					'testing-library/no-global-regexp-flag-in-query': 'error',
					'testing-library/no-node-access': 'error',
					'testing-library/no-promise-in-fire-event': 'error',
					'testing-library/no-render-in-lifecycle': 'error',
					'testing-library/no-unnecessary-act': 'error',
					'testing-library/no-wait-for-multiple-assertions': 'error',
					'testing-library/no-wait-for-side-effects': 'error',
					'testing-library/no-wait-for-snapshot': 'error',
					'testing-library/prefer-find-by': 'error',
					'testing-library/prefer-presence-queries': 'error',
					'testing-library/prefer-query-by-disappearance': 'error',
					'testing-library/prefer-screen-queries': 'error',
					'testing-library/render-result-naming-convention': 'error',
					'vitest/no-importing-vitest-globals': 'off',
					'vitest/no-standalone-expect': 'error',
					'vitest/prefer-expect-assertions': 'off',
					'vitest/require-test-timeout': 'off',
					'vitest/require-top-level-describe': 'off',
					'vitest/valid-title': 'off',
				},
			},
			{
				files: ['**/*.tsx'],
				rules: {
					'react/only-export-components': 'error',
					'typescript/explicit-module-boundary-types': 'off',
				},
			},
		],
		plugins: ['eslint', 'oxc', 'react', 'typescript', 'unicorn'],
		rules: {
			...sharedRules,
			'func-style': ['error', 'declaration'],
			'no-magic-numbers': 'off',
			'no-rest-spread-properties': 'off',
			'no-ternary': 'off',
			'no-undefined': 'off',
			'no-use-before-define': 'off',
			'one-var': 'off',
			'oxc/no-optional-chaining': 'off',
			'react/jsx-filename-extension': 'off',
			'react/jsx-max-depth': 'off',
			'react/jsx-no-literals': 'off',
			'react/no-multi-comp': 'off',
			'react/react-in-jsx-scope': 'off',
			'sort-imports': 'off',
			'sort-keys': 'off',
			'sort-vars': 'off',
			'typescript/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
			'typescript/explicit-function-return-type': 'off',
			'typescript/no-import-type-side-effects': 'off',
			'typescript/prefer-readonly-parameter-types': 'off',
			'unicorn/no-null': 'off',
			'vitest/consistent-test-filename': ['error', { pattern: '.*\\.spec\\.tsx?$' }],
			'vitest/no-hooks': 'off',
		},
	},
	scripts: {
		categories: {
			correctness: 'error',
			nursery: 'warn',
			pedantic: 'warn',
			perf: 'error',
			restriction: 'error',
			style: 'warn',
			suspicious: 'warn',
		},
		env: {
			builtin: true,
			node: true,
		},
		options: {
			typeAware: true,
			typeCheck: true,
		},
		rules: {
			...sharedRules,
			'func-style': ['error', 'declaration'],
			'no-magic-numbers': 'off',
			'no-rest-spread-properties': 'off',
			'one-var': 'off',
			'sort-imports': 'off',
			'sort-keys': 'off',
			'sort-vars': 'off',
			'typescript/prefer-readonly-parameter-types': 'off',
		},
	},
} as const satisfies Record<string, OxlintConfig>
