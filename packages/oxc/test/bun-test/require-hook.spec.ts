import { describe } from 'vite-plus/test'

import { requireHook } from '../../src/bun-test/rules/require-hook.ts'
import { ruleTester } from './tester.ts'

describe('bun:test/require-hook', () => {
	ruleTester.run('require-hook', requireHook, {
		valid: [
			// Imports, constants, helpers, then one describe holding the rest
			[
				"import { beforeEach, describe, it, mock, spyOn } from 'bun:test'",
				"const name = 'x'",
				'const { db } = createTestDb()',
				'function stubLog() { return spyOn(console, "log") }',
				"describe('a', () => {",
				"\tmock.module('./x', () => ({}))",
				"\tbeforeEach(() => { spyOn(console, 'log') })",
				"\tit('works', () => {})",
				'})',
			].join('\n'),
			// Test structure is checked by the other rules
			"import { afterAll, it, test } from 'bun:test'\nit('a', () => {})\ntest('b', () => {})\nafterAll(() => {})",
			// Without a bun:test import the file is not a bun:test spec
			"setup()\ndescribe('a', () => {})",
			// `spyOn` from elsewhere is an ordinary call
			"import { describe } from 'bun:test'\nimport { spyOn } from './spies'\nconst stub = spyOn()",
		],
		invalid: [
			{
				code: "import { mock } from 'bun:test'\nmock.module('./x', () => ({}))",
				errors: [{ messageId: 'topLevelSetup', line: 2, column: 0 }],
			},
			{
				code: "import { mock } from 'bun:test'\nawait mock.module('./x', () => ({}))",
				errors: [{ messageId: 'topLevelSetup' }],
			},
			{
				code: "import { describe } from 'bun:test'\nresetDatabase()",
				errors: [{ messageId: 'topLevelSetup' }],
			},
			{
				code: "import { spyOn } from 'bun:test'\nconst log = spyOn(console, 'log')",
				errors: [{ messageId: 'topLevelSetup' }],
			},
			{
				code: "import { mock } from 'bun:test'\nlet fetcher = mock(() => 1)",
				errors: [{ messageId: 'topLevelSetup' }],
			},
			{
				code: "import { jest } from 'bun:test'\nconst callback = jest.fn()",
				errors: [{ messageId: 'topLevelSetup' }],
			},
			{
				code: "import * as bt from 'bun:test'\nconst log = bt.spyOn(console, 'log')",
				errors: [{ messageId: 'topLevelSetup' }],
			},
		],
	})
})
