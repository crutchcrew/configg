import { defineRule } from '@oxlint/plugins'

import { hooks, topLevelBunTestCalls } from '../shared/bun-test.ts'
import { docsUrl } from '../shared/docs.ts'

/** Report `beforeAll`, `beforeEach`, `afterAll` or `afterEach` at the top level of a file. */
export const noTopLevelHooks = defineRule({
	meta: {
		type: 'suggestion',
		docs: {
			description: 'Require `bun:test` hooks to be scoped to a `describe`.',
			url: docsUrl('no-top-level-hooks'),
		},
		messages: {
			topLevelHook: 'Scope this hook in the `describe` whose tests need it.',
		},
		schema: [],
	},
	create(context) {
		return {
			Program(program): void {
				for (const { name, statement } of topLevelBunTestCalls(context.sourceCode, program)) {
					if (hooks.has(name)) {
						context.report({ node: statement, messageId: 'topLevelHook' })
					}
				}
			},
		}
	},
})
