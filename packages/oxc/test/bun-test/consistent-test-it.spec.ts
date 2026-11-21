import { describe } from 'vite-plus/test'

import { consistentTestIt } from '../../src/bun-test/rules/consistent-test-it.ts'
import { ruleTester } from './tester.ts'

describe('bun:test/consistent-test-it', () => {
	ruleTester.run('consistent-test-it', consistentTestIt, {
		valid: [
			"import { describe, it } from 'bun:test'\ndescribe('a', () => { it('works', () => {}) })",
			"import { it } from 'bun:test'\nit.each([1, 2])('works for %d', () => {})",
			// `it` imported as `test` is still `it`
			"import { it as test } from 'bun:test'\ntest('works', () => {})",
			// Not from bun:test: a global, another module, or a local that shadows the import
			"test('global', () => {})",
			"import { test } from 'vitest'\ntest('vitest', () => {})",
			"import { test } from 'bun:test'\nfunction run(test: (name: string) => void) { test('local') }",
		],
		invalid: [
			{
				code: "import { describe, it, test } from 'bun:test'\ndescribe('a', () => { test('works', () => {}) })",
				output:
					"import { describe, it, test } from 'bun:test'\ndescribe('a', () => { it('works', () => {}) })",
				errors: [{ messageId: 'useIt', line: 2, column: 22 }],
			},
			{
				code: "import { it, test } from 'bun:test'\ntest.each([1, 2])('works for %d', () => {})",
				output: "import { it, test } from 'bun:test'\nit.each([1, 2])('works for %d', () => {})",
				errors: [{ messageId: 'useIt' }],
			},
			{
				code: "import { it, test } from 'bun:test'\ntest.skip('later', () => {})",
				output: "import { it, test } from 'bun:test'\nit.skip('later', () => {})",
				errors: [{ messageId: 'useIt' }],
			},
			// The fix uses whatever name `it` is imported under
			{
				code: "import { it as spec, test } from 'bun:test'\ntest('works', () => {})",
				output: "import { it as spec, test } from 'bun:test'\nspec('works', () => {})",
				errors: [{ messageId: 'useIt' }],
			},
			{
				code: "import * as bt from 'bun:test'\nbt.test('works', () => {})",
				output: "import * as bt from 'bun:test'\nbt.it('works', () => {})",
				errors: [{ messageId: 'useIt' }],
			},
			// Renamed, but still `test`; without `it` imported there is nothing to fix to
			{
				code: "import { test as check } from 'bun:test'\ncheck('works', () => {})",
				output: null,
				errors: [{ messageId: 'useIt' }],
			},
		],
	})
})
