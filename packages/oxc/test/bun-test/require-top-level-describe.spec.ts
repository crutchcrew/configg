import { describe } from 'vite-plus/test'

import { requireTopLevelDescribe } from '../../src/bun-test/rules/require-top-level-describe.ts'
import { ruleTester } from './tester.ts'

describe('bun:test/require-top-level-describe', () => {
	ruleTester.run('require-top-level-describe', requireTopLevelDescribe, {
		valid: [
			"import { describe, it } from 'bun:test'\ndescribe('a', () => { it('works', () => {}) })",
			"import { describe, it } from 'bun:test'\ndescribe('a', () => { describe('b', () => { it.each([1])('%d', () => {}) }) })",
			// Not from bun:test
			"it('global', () => {})",
			"import { it } from 'vitest'\nit('vitest', () => {})",
		],
		invalid: [
			{
				code: "import { it } from 'bun:test'\nit('works', () => {})",
				errors: [{ messageId: 'topLevelCase', line: 2, column: 0 }],
			},
			{
				code: "import { test } from 'bun:test'\ntest.each([1, 2])('works for %d', () => {})",
				errors: [{ messageId: 'topLevelCase' }],
			},
			{
				code: "import { it } from 'bun:test'\nawait it('works', async () => {})",
				errors: [{ messageId: 'topLevelCase' }],
			},
			{
				code: "import * as bt from 'bun:test'\nbt.it.skip('later', () => {})",
				errors: [{ messageId: 'topLevelCase' }],
			},
		],
	})
})
