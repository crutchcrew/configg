import { defineConfig as defineOxfmtConfig } from 'oxfmt'
import { defineConfig as defineOxlintConfig } from 'oxlint'
import { describe, expect, it } from 'vite-plus/test'

import { configs as fmt } from '../src/fmt.ts'
import { antiSlop, bunTest, configs as lint, react, vitest } from '../src/lint.ts'

const presets = {
	'fmt.client': fmt.client,
	'fmt.scripts': fmt.scripts,
	'fmt.server': fmt.server,
	'lint.client': lint.client,
	'lint.scripts': lint.scripts,
	antiSlop,
	bunTest,
	react,
	vitest,
}

const stylesheet = 'packages/app/src/main.css'

describe('presets', () => {
	describe.each(Object.entries(presets))('%s', (_name, preset) => {
		it('is a plain object, as oxlint and oxfmt require of a config', () => {
			expect(preset).toBeTypeOf('object')
			expect(Object.getPrototypeOf(preset)).toBe(Object.prototype)
		})

		it('spreads to its fields alone', () => {
			const spread = { ...preset }

			expect(Object.keys(spread)).toStrictEqual(Object.keys(preset))
			expect('with' in spread).toBe(false)
		})

		it('serializes to its fields alone', () => {
			expect(JSON.stringify(preset)).toBe(JSON.stringify({ ...preset }))
			expect(JSON.stringify({ value: preset })).toBe(JSON.stringify({ value: { ...preset } }))
		})

		it('survives structuredClone as its fields', () => {
			expect(structuredClone(preset)).toStrictEqual({ ...preset })
		})

		it('returns an equal preset when called with no overrides', () => {
			const same = preset.with({})

			expect(same).toStrictEqual({ ...preset })
			expect(same).not.toBe(preset)
		})
	})
})

describe('with()', () => {
	it('merges nested objects and keeps their other keys', () => {
		const client = fmt.client.with({ sortTailwindcss: { stylesheet } })

		expect(client.sortTailwindcss).toStrictEqual({
			attributes: ['class', 'className'],
			functions: ['cx', 'createVariants'],
			stylesheet,
		})
		expect(client.sortImports).toBe(fmt.client.sortImports)
		expect(client.printWidth).toBe(100)
	})

	it('leaves the preset unchanged', () => {
		fmt.client.with({ printWidth: 80, sortTailwindcss: { stylesheet } })

		expect(fmt.client.printWidth).toBe(100)
		expect(fmt.client.sortTailwindcss).toStrictEqual({
			attributes: ['class', 'className'],
			functions: ['cx', 'createVariants'],
		})
	})

	it('replaces arrays, so an empty array clears one', () => {
		const client = fmt.client.with({ sortTailwindcss: { functions: [] } })

		expect(client.sortTailwindcss).toStrictEqual({
			attributes: ['class', 'className'],
			functions: [],
		})
	})

	it('replaces scalars, and objects with scalars', () => {
		const client = fmt.client.with({ semi: true, sortTailwindcss: false })

		expect(client.semi).toBe(true)
		expect(client.sortTailwindcss).toBe(false)
	})

	it('keeps the preset value for a key set to undefined', () => {
		const client = fmt.client.with({ semi: undefined, sortTailwindcss: { stylesheet: undefined } })

		expect(client).toStrictEqual({ ...fmt.client })
	})

	it('merges rules into a lint preset and replaces rule settings', () => {
		const scripts = lint.scripts.with({
			rules: { 'eslint/max-statements': ['warn', { max: 50 }], 'eslint/no-console': 'off' },
		})

		expect(scripts.rules?.['eslint/max-statements']).toStrictEqual(['warn', { max: 50 }])
		expect(scripts.rules?.['eslint/no-console']).toBe('off')
		expect(scripts.rules?.['eslint/eqeqeq']).toBe('error')
		expect(scripts.overrides).toBe(lint.scripts.overrides)
	})

	it('merges into the preset as it is now', () => {
		const client = fmt.client.with({ printWidth: 90 })

		client.printWidth = 120

		expect(client.with({}).printWidth).toBe(120)
	})

	it('returns a preset, so calls chain and the result spreads and serializes', () => {
		const client = fmt.client.with({ sortTailwindcss: { stylesheet } }).with({ printWidth: 120 })

		expect(client.printWidth).toBe(120)
		expect(client.sortTailwindcss).toMatchObject({ stylesheet })
		expect('with' in { ...client }).toBe(false)
		expect(JSON.stringify(client)).toBe(JSON.stringify({ ...client }))
	})

	it('rejects keys the config type lacks, which only the types guard', () => {
		// @ts-expect-error -- `sortTailwind` isn't an oxfmt option
		const topLevel = fmt.client.with({ sortTailwind: { stylesheet } })
		// @ts-expect-error -- nor is `stylesheets` a sortTailwindcss option
		const nested = fmt.client.with({ sortTailwindcss: { stylesheets: stylesheet } })
		// @ts-expect-error -- `printWidth` is a number
		const mistyped = fmt.client.with({ printWidth: '100' })
		// @ts-expect-error -- `overrides` is an array, which replaces whole
		fmt.client.with({ overrides: {} })
		// @ts-expect-error -- so each entry is a whole override, which needs `files`
		fmt.client.with({ overrides: [{ options: { semi: true } }] })

		expect(topLevel).toHaveProperty('sortTailwind')
		expect(nested.sortTailwindcss).toHaveProperty('stylesheets')
		expect(mistyped.printWidth).toBe('100')
	})
})

describe('composition', () => {
	it('works in oxlint extends, called or not', () => {
		const config = defineOxlintConfig({
			...lint.client,
			extends: [antiSlop, bunTest.with({ rules: { 'bun:test/require-hook': 'off' } })],
		})

		const plain = {
			...lint.client,
			extends: [
				{ ...antiSlop },
				{ ...bunTest, rules: { ...bunTest.rules, 'bun:test/require-hook': 'off' } },
			],
		}

		expect(JSON.stringify(config)).toBe(JSON.stringify(plain))
	})

	it('works as a base preset passed directly, or in extends', () => {
		const direct = defineOxlintConfig(lint.scripts)
		const extended = defineOxlintConfig({ extends: [lint.client] })

		expect(JSON.stringify(direct)).toBe(JSON.stringify({ ...lint.scripts }))
		expect(JSON.stringify(extended)).toBe(JSON.stringify({ extends: [{ ...lint.client }] }))
	})

	it('works in oxfmt overrides, called or not', () => {
		const config = defineOxfmtConfig({
			...fmt.scripts,
			overrides: [
				{
					files: ['packages/app/**'],
					options: fmt.client.with({ sortTailwindcss: { stylesheet } }),
				},
				{ files: ['packages/server/**'], options: fmt.server },
			],
		})

		const plain = {
			...fmt.scripts,
			overrides: [
				{
					files: ['packages/app/**'],
					options: {
						...fmt.client,
						sortTailwindcss: { ...fmt.client.sortTailwindcss, stylesheet },
					},
				},
				{ files: ['packages/server/**'], options: { ...fmt.server } },
			],
		}

		expect(JSON.stringify(config)).toBe(JSON.stringify(plain))
	})
})
