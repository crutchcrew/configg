import { defineRule, type ESTree, type SourceCode } from '@oxlint/plugins'

import {
	bunTestCallee,
	importsBunTest,
	mockFactories,
	structural,
	topLevelCall,
} from '../shared/bun-test.ts'
import { docsUrl } from '../shared/docs.ts'

// `describe`, `it`, `test` and the hooks have rules of their own; any other call at the top level is setup
function isSetupCall(sourceCode: SourceCode, call: ESTree.CallExpression): boolean {
	const reference = bunTestCallee(sourceCode, call.callee)

	return reference === null || !structural.has(reference.name)
}

// `const stub = spyOn(...)` at the top level is setup that belongs in a hook, whatever the declaration kind
function isMockDeclaration(
	sourceCode: SourceCode,
	statement: ESTree.Directive | ESTree.Statement,
): boolean {
	if (statement.type !== 'VariableDeclaration') {
		return false
	}

	return statement.declarations.some(({ init }) => {
		if (init?.type !== 'CallExpression') {
			return false
		}

		const reference = bunTestCallee(sourceCode, init.callee)

		return reference !== null && mockFactories.has(reference.name)
	})
}

/**
 * Report setup at the top level of a `bun:test` spec: a call statement other than `describe`, a test or a hook (such as
 * `mock.module(...)`, awaited or not), or a declaration initialised with a `bun:test` mock or spy.
 */
export const requireHook = defineRule({
	meta: {
		type: 'suggestion',
		docs: {
			description: 'Require setup in a `bun:test` spec to run inside a hook, not at the top level.',
			url: docsUrl('require-hook'),
		},
		messages: {
			topLevelSetup: 'Move this setup into a hook inside the `describe` that needs it.',
		},
		schema: [],
	},
	create(context) {
		// Without a `bun:test` import there is nothing for this rule to match, so skip the file
		if (!importsBunTest(context.sourceCode.ast)) {
			return {}
		}

		const { sourceCode } = context

		return {
			Program(program): void {
				for (const statement of program.body) {
					const call = topLevelCall(statement)

					if (
						(call !== null && isSetupCall(sourceCode, call)) ||
						isMockDeclaration(sourceCode, statement)
					) {
						context.report({ node: statement, messageId: 'topLevelSetup' })
					}
				}
			},
		}
	},
})
