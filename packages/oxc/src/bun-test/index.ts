/*
 * Oxlint plugin for the layout of `bun:test` specs. The built-in `jest`/`vitest` rules only recognise `describe`, `it`
 * and the hooks when they are globals or come from `vitest`/`@jest/globals`, so they see nothing in a file that
 * imports them from `bun:test`. These rules resolve each name to its `bun:test` import instead.
 *
 * Docs: ../../docs/bun-test/README.md
 */
import { definePlugin } from '@oxlint/plugins'

import { consistentTestIt } from './rules/consistent-test-it.ts'
import { noTopLevelHooks } from './rules/no-top-level-hooks.ts'
import { requireHook } from './rules/require-hook.ts'
import { requireTopLevelDescribe } from './rules/require-top-level-describe.ts'
import { singleTopLevelDescribe } from './rules/single-top-level-describe.ts'

export default definePlugin({
	meta: { name: 'bun:test' },
	rules: {
		'consistent-test-it': consistentTestIt,
		'no-top-level-hooks': noTopLevelHooks,
		'require-hook': requireHook,
		'require-top-level-describe': requireTopLevelDescribe,
		'single-top-level-describe': singleTopLevelDescribe,
	},
})
