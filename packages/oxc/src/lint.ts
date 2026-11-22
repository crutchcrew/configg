import type { OxlintConfig } from 'oxlint'

import { definePresets } from './preset.ts'

export type { DeepPartial, Preset } from './preset.ts'

const preset = definePresets<OxlintConfig>()

const antiSlopPlugin = { name: 'anti-slop', specifier: `${import.meta.dirname}/anti-slop/index.ts` }

const bunTestPlugin = { name: 'bun:test', specifier: `${import.meta.dirname}/bun-test/index.ts` }

const sharedRules = {
	// Only the first line of a wrapped `//` comment needs a capital. Tool pragmas that must stay lowercase are skipped;
	// oxlint already skips its own and ESLint's directives, `prettier-ignore`, `istanbul` and `jshint`.
	'eslint/capitalized-comments': [
		'warn',
		'always',
		{
			ignoreConsecutiveComments: true,
			ignorePattern:
				'svelte-ignore|biome-ignore|c8 ignore|v8 ignore|cspell:|noinspection|webpack[A-Z]',
		},
	],
	'eslint/eqeqeq': 'error',
	'eslint/id-length': 'off',
	// For a variable with no meaningful starting value it wants `let x = undefined`, which unicorn/no-useless-undefined
	// rejects. Keep that rule and write `let x: T | undefined`.
	'eslint/init-declarations': 'off',
	'eslint/max-classes-per-file': ['warn', { max: 2 }],
	'eslint/max-lines-per-function': ['warn', { max: 100, skipBlankLines: true, skipComments: true }],
	'eslint/max-statements': ['warn', { max: 30 }],
	'eslint/no-continue': 'off',
	// Both require-await rules: typescript/promise-function-async makes promise-returning functions async without an await.
	'eslint/require-await': 'off',
	'import/prefer-default-export': 'off',
	'oxc/no-async-await': 'off',
	'typescript/require-await': 'off',
	'typescript/restrict-template-expressions': [
		'error',
		{
			allowBoolean: true,
			allowNever: true,
			allowNullish: true,
			allowNumber: true,
		},
	],
	'typescript/strict-boolean-expressions': 'error',
	'unicorn/import-style': 'off',
	'unicorn/no-array-for-each': 'off',
	'unicorn/no-array-reduce': 'off',
	'unicorn/no-process-exit': 'off',
	// Oxfmt and Prettier write hex digits in lowercase; this rule wants uppercase and takes no option.
	'unicorn/number-literal-case': 'off',
} as const satisfies OxlintConfig['rules']

/** Opt in by adding to `extends` after the base preset. The plugin ships as TypeScript, so run oxlint under Bun. */
export const antiSlop = preset({
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
})

/**
 * Opt in by adding to `extends`: the `bun:test` plugin with its five rules as errors. There is no file glob: the rules
 * only act on files that import from `bun:test`, whatever they are named. The plugin ships as TypeScript, so run oxlint
 * under Bun. Docs: ../docs/bun-test/README.md
 */
export const bunTest = preset({
	jsPlugins: [bunTestPlugin],
	rules: {
		'bun:test/consistent-test-it': 'error',
		'bun:test/no-top-level-hooks': 'error',
		'bun:test/require-hook': 'error',
		'bun:test/require-top-level-describe': 'error',
		'bun:test/single-top-level-describe': 'error',
	},
})

const categories = {
	correctness: 'error',
	nursery: 'warn',
	pedantic: 'warn',
	perf: 'error',
	restriction: 'error',
	style: 'warn',
	suspicious: 'warn',
} as const satisfies OxlintConfig['categories']

const options = {
	typeAware: true,
	typeCheck: true,
} as const satisfies OxlintConfig['options']

/**
 * Opt in by adding to `extends` after `configs.client`: the React plugin, React rule settings and a `*.tsx` override.
 */
export const react = preset({
	overrides: [
		{
			files: ['**/*.tsx'],
			rules: {
				'react/only-export-components': 'error',
				'typescript/explicit-module-boundary-types': 'off',
			},
		},
	],
	plugins: ['react'],
	rules: {
		'react/jsx-filename-extension': 'off',
		'react/jsx-max-depth': 'off',
		'react/jsx-no-literals': 'off',
		'react/no-multi-comp': 'off',
		'react/react-in-jsx-scope': 'off',
	},
})

/**
 * Opt in by adding to `extends`: Vitest and Testing Library (React) rules for `*.spec.{ts,tsx}` files. Needs
 * `eslint-plugin-testing-library`.
 */
export const vitest = preset({
	overrides: [
		{
			env: {
				vitest: true,
			},
			files: ['**/*.spec.{ts,tsx}'],
			jsPlugins: ['eslint-plugin-testing-library'],
			// This exact list is what the spec override has always used. With it, oxlint 1.94 runs the Vitest rules set
			// below but not Vitest's category rules (`no-focused-tests` and the rest); a shorter list such as
			// `['vitest']` turns those on. Keep it until that is a deliberate change.
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
				'vitest/consistent-test-filename': ['error', { pattern: String.raw`.*\.spec\.tsx?$` }],
				'vitest/no-hooks': 'off',
				'vitest/no-importing-vitest-globals': 'off',
				'vitest/no-standalone-expect': 'error',
				'vitest/prefer-expect-assertions': 'off',
				'vitest/require-test-timeout': 'off',
				'vitest/require-top-level-describe': 'off',
				'vitest/valid-title': 'off',
			},
		},
	],
})

/*
 * Base presets work in `extends` as well as spread. Oxlint's `extends` drops a top-level `env` or `globals`, so each
 * preset sets its environment in a catch-all override, which `extends` keeps. Each one is a plain config object; call
 * `.with(overrides)` on one to deep-merge changes into it.
 */
export const configs = {
	client: preset({
		categories,
		options,
		overrides: [
			{
				env: {
					browser: true,
					builtin: true,
				},
				files: ['**/*'],
			},
		],
		plugins: ['eslint', 'oxc', 'typescript', 'unicorn'],
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
			'sort-imports': 'off',
			'sort-keys': 'off',
			'sort-vars': 'off',
			'typescript/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
			'typescript/explicit-function-return-type': 'off',
			'typescript/no-import-type-side-effects': 'off',
			'typescript/prefer-readonly-parameter-types': 'off',
			'unicorn/no-null': 'off',
		},
	}),
	scripts: preset({
		categories,
		options,
		overrides: [
			{
				env: {
					builtin: true,
					node: true,
				},
				files: ['**/*'],
			},
		],
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
	}),
}
