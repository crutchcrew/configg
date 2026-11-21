import { describe } from 'vite-plus/test'

import { singleTopLevelDescribe } from '../../src/bun-test/rules/single-top-level-describe.ts'
import { ruleTester } from './tester.ts'

describe('bun:test/single-top-level-describe', () => {
	ruleTester.run('single-top-level-describe', singleTopLevelDescribe, {
		valid: [
			"import { describe } from 'bun:test'\ndescribe('a', () => {})",
			"import { describe } from 'bun:test'\ndescribe('a', () => { describe('b', () => {}); describe('c', () => {}) })",
			// A file with no describe at all is left to require-top-level-describe
			"import { it } from 'bun:test'\nit('works', () => {})",
			// Not from bun:test
			"describe('a', () => {})\ndescribe('b', () => {})",
		],
		invalid: [
			{
				code: "import { describe } from 'bun:test'\ndescribe('a', () => {})\ndescribe('b', () => {})",
				errors: [{ messageId: 'extraDescribe', line: 3, column: 0 }],
			},
			{
				code: "import { describe } from 'bun:test'\ndescribe('a', () => {})\ndescribe.skip('b', () => {})\ndescribe.each([1])('c %d', () => {})",
				errors: [
					{ messageId: 'extraDescribe', line: 3 },
					{ messageId: 'extraDescribe', line: 4 },
				],
			},
		],
	})
})
