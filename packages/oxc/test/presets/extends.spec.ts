import { spawnSync } from 'node:child_process'
import { join } from 'node:path'

import { describe, expect, it } from 'vite-plus/test'

const fixtures = join(import.meta.dirname, 'fixtures')

const oxlint = join(import.meta.dirname, '../../../../node_modules/oxlint/bin/oxlint')

interface Diagnostic {
	code: string
	filename: string
	labels: { span: { column: number; line: number } }[]
	severity: string
}

// `vp test` sets VP_VERSION, which makes oxlint read a config as a Vite+ file with a `lint` field
const { VP_VERSION: _vitePlus, ...env } = process.env

// Every diagnostic oxlint reports for the fixture sources under one config, as sorted `file:line:col rule severity` lines
function lint(config: string): string[] {
	// Oxlint exits 1 when it reports errors, which the fixtures are written to produce, so only stdout matters
	const { stdout } = spawnSync(
		process.execPath,
		[oxlint, '-c', join(fixtures, 'configs', `${config}.ts`), '-f', 'json', 'src'],
		{ cwd: fixtures, encoding: 'utf8', env },
	)

	// oxlint-disable-next-line anti-slop/require-safety-comment-for-type-assertion, typescript/no-unsafe-type-assertion -- oxlint's JSON reporter output
	const { diagnostics } = JSON.parse(stdout) as { diagnostics: Diagnostic[] }

	return diagnostics
		.map(({ code, filename, labels, severity }) => {
			const span = labels[0]?.span

			return `${filename}:${span?.line ?? 0}:${span?.column ?? 0} ${code} ${severity}`
		})
		.toSorted()
}

describe('base presets in extends', () => {
	it.each([
		['configs.client', 'client-spread', 'client-extends'],
		['configs.client with react and vitest', 'client-addons-spread', 'client-addons-extends'],
		['configs.scripts', 'scripts-spread', 'scripts-extends'],
	])('%s reports the same diagnostics extended as spread', (_name, spread, extended) => {
		const expected = lint(spread)

		// Two runs that both report nothing would also compare equal
		expect(expected.length).toBeGreaterThan(0)
		expect(lint(extended)).toEqual(expected)
	})

	it('keeps the browser env of configs.client through extends', () => {
		const undefinedGlobals = lint('client-extends').filter((line) => line.includes('no-undef'))

		// `window` in app.ts is defined; `process` in tool.ts is not
		expect(undefinedGlobals.some((line) => line.startsWith('src/app.ts'))).toBe(false)
		expect(undefinedGlobals.some((line) => line.startsWith('src/tool.ts:1:'))).toBe(true)
	})

	it('keeps the Node env of configs.scripts through extends', () => {
		const undefinedGlobals = lint('scripts-extends').filter((line) => line.includes('no-undef'))

		// `process` in tool.ts is defined; `document` on its next line and `window` in app.ts are not
		expect(undefinedGlobals.some((line) => line.startsWith('src/tool.ts:1:'))).toBe(false)
		expect(undefinedGlobals.some((line) => line.startsWith('src/tool.ts:2:'))).toBe(true)
		expect(undefinedGlobals.some((line) => line.startsWith('src/app.ts:1:'))).toBe(true)
	})
})

describe('presets called with .with() in extends', () => {
	it('reports the same diagnostics as the spread equivalent', () => {
		const expected = lint('client-with-spread')

		expect(expected.length).toBeGreaterThan(0)
		expect(lint('client-with-extends')).toEqual(expected)
	})

	it('applies the overrides and keeps the rest of each preset', () => {
		const codes = new Set(lint('client-with-extends').map((line) => line.split(' ')[1]))
		const unchanged = new Set(lint('client-addons-extends').map((line) => line.split(' ')[1]))

		// Turned off by .with(), and reported without it
		expect(unchanged.has('eslint(eqeqeq)')).toBe(true)
		expect(unchanged.has('react(jsx-key)')).toBe(true)
		expect(codes.has('eslint(eqeqeq)')).toBe(false)
		expect(codes.has('react(jsx-key)')).toBe(false)
		// Still there: the browser env, the react override and the vitest add-on
		expect(codes.has('eslint(no-undef)')).toBe(true)
		expect(codes.has('react(only-export-components)')).toBe(true)
		expect(codes.has('vitest(no-standalone-expect)')).toBe(true)
	})
})
