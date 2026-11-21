import { defineRule, type Fix } from '@oxlint/plugins'

import { bunTestCallee, localIt } from '../shared/bun-test.ts'
import { docsUrl } from '../shared/docs.ts'

/** Write every test as `it(...)`: `test(...)` and `test.each(...)` from `bun:test` are reported. */
export const consistentTestIt = defineRule({
	meta: {
		type: 'suggestion',
		docs: {
			description: 'Require `it(...)` instead of `test(...)` in `bun:test` specs.',
			url: docsUrl('consistent-test-it'),
		},
		fixable: 'code',
		messages: {
			useIt: 'Write `it(...)`, not `test(...)`: a bun:test spec reads as behaviour.',
		},
		schema: [],
	},
	create(context) {
		const { sourceCode } = context

		return {
			CallExpression(node): void {
				// `test.each([...])('name', fn)` reports once, at the inner `test.each(...)` call
				if (node.callee.type === 'CallExpression') {
					return
				}

				const reference = bunTestCallee(sourceCode, node.callee)

				if (reference?.name !== 'test') {
					return
				}

				// `bt.test(...)` becomes `bt.it(...)`; a bare `test(...)` becomes `it(...)` only when `it` is imported too
				const replacement = reference.viaNamespace
					? 'it'
					: localIt(sourceCode, sourceCode.ast, node)

				context.report({
					node,
					messageId: 'useIt',
					fix: (fixer): Fix | null =>
						replacement === null ? null : fixer.replaceText(reference.node, replacement),
				})
			},
		}
	},
})
