import { describe } from 'vite-plus/test'

import { noTopLevelHooks } from '../../src/bun-test/rules/no-top-level-hooks.ts'
import { ruleTester } from './tester.ts'

describe('bun:test/no-top-level-hooks', () => {
	ruleTester.run('no-top-level-hooks', noTopLevelHooks, {
		valid: [
			"import { beforeEach, describe } from 'bun:test'\ndescribe('a', () => { beforeEach(() => {}) })",
			// Not from bun:test
			'beforeAll(() => {})',
			"import { afterEach } from 'vitest'\nafterEach(() => {})",
		],
		invalid: [
			{
				code: "import { beforeAll } from 'bun:test'\nbeforeAll(() => {})",
				errors: [{ messageId: 'topLevelHook', line: 2, column: 0 }],
			},
			{
				code: "import { afterAll, afterEach, beforeEach } from 'bun:test'\nbeforeEach(() => {})\nafterEach(() => {})\nafterAll(() => {})",
				errors: [
					{ messageId: 'topLevelHook', line: 2 },
					{ messageId: 'topLevelHook', line: 3 },
					{ messageId: 'topLevelHook', line: 4 },
				],
			},
			{
				code: "import { beforeAll as setup } from 'bun:test'\nsetup(() => {})",
				errors: [{ messageId: 'topLevelHook' }],
			},
		],
	})
})
