import { RuleTester } from 'oxlint/plugins-dev'
import { describe, it } from 'vite-plus/test'

// RuleTester needs Node.js, so these specs run under `vp test` (Vitest) rather than `bun test`
RuleTester.describe = (text, fn): void => {
	describe(text, fn)
}

RuleTester.it = (text, fn): void => {
	it(text, fn)
}

/** Parses every case as a TypeScript module. */
export const ruleTester = new RuleTester({
	languageOptions: { parserOptions: { lang: 'ts' }, sourceType: 'module' },
})
