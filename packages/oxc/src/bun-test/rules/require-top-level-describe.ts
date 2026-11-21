import { defineRule } from '@oxlint/plugins'

import { cases, importsBunTest, topLevelBunTestCalls } from '../shared/bun-test.ts'
import { docsUrl } from '../shared/docs.ts'

/** Report an `it(...)` or `test(...)` call at the top level of a file instead of inside its `describe`. */
export const requireTopLevelDescribe = defineRule({
	meta: {
		type: 'suggestion',
		docs: {
			description: 'Require every `bun:test` test case to sit inside a `describe`.',
			url: docsUrl('require-top-level-describe'),
		},
		messages: {
			topLevelCase: 'Put this test inside the file’s one top-level `describe`.',
		},
		schema: [],
	},
	create(context) {
		// Without a `bun:test` import there is nothing for this rule to match, so skip the file
		if (!importsBunTest(context.sourceCode.ast)) {
			return {}
		}

		return {
			Program(program): void {
				for (const { name, statement } of topLevelBunTestCalls(context.sourceCode, program)) {
					if (cases.has(name)) {
						context.report({ node: statement, messageId: 'topLevelCase' })
					}
				}
			},
		}
	},
})
