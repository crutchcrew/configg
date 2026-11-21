import { defineRule } from '@oxlint/plugins'

import { describes, topLevelBunTestCalls } from '../shared/bun-test.ts'
import { docsUrl } from '../shared/docs.ts'

/** Report every top-level `describe` after the first: a spec has one, and the rest nest inside it. */
export const singleTopLevelDescribe = defineRule({
	meta: {
		type: 'suggestion',
		docs: {
			description: 'Allow at most one top-level `describe` per `bun:test` spec.',
			url: docsUrl('single-top-level-describe'),
		},
		messages: {
			extraDescribe: 'A spec has one top-level `describe`; nest this one inside it.',
		},
		schema: [],
	},
	create(context) {
		return {
			Program(program): void {
				let seen = false

				for (const { name, statement } of topLevelBunTestCalls(context.sourceCode, program)) {
					if (!describes.has(name)) {
						continue
					}

					if (seen) {
						context.report({ node: statement, messageId: 'extraDescribe' })
					}

					seen = true
				}
			},
		}
	},
})
