import type { ESTree, Scope, SourceCode, Variable } from '@oxlint/plugins'

/*
 * Every rule in this plugin matches names by where they were imported from, not by spelling. `describe`, `it` and
 * the rest count only when they are bound to an import from `bun:test`: a named import (renamed or not) or a member
 * of a namespace import. A local variable that shadows one of them is not a match, and neither is a global.
 */

const source = 'bun:test'

export const describes = new Set(['describe'])

export const cases = new Set(['it', 'test'])

export const hooks = new Set(['afterAll', 'afterEach', 'beforeAll', 'beforeEach'])

/** Exports whose result is a mock or spy: `spyOn(...)`, `mock(...)`, `mock.module(...)`, `jest.fn()`, `vi.fn()`. */
export const mockFactories = new Set(['jest', 'mock', 'spyOn', 'vi'])

/** The call a spec is built from: `describe`, `it`, `test` and the four hooks. */
export const structural = new Set([...describes, ...cases, ...hooks])

/** A reference to a `bun:test` export: its exported name and the identifier in the source that names it. */
export interface BunTestReference {
	/** The name `bun:test` exports it under, whatever the local binding is called. */
	name: string
	/** The local identifier (`test` in `test(...)`) or, for a namespace import, the member (`test` in `bt.test(...)`). */
	node: ESTree.IdentifierName | ESTree.IdentifierReference
	/** Whether it is reached through a namespace import (`import * as bt from 'bun:test'`). */
	viaNamespace: boolean
}

// The variable `name` refers to at `node`, walking lexical scopes upward
function findVariable(sourceCode: SourceCode, node: ESTree.Node, name: string): Variable | null {
	let scope: Scope | null = sourceCode.getScope(node)

	while (scope !== null) {
		const variable = scope.set.get(name)

		if (variable !== undefined) {
			return variable
		}

		scope = scope.upper
	}

	return null
}

type Binding = { kind: 'named'; name: string } | { kind: 'namespace' }

// What `name` is bound to at `node`, when that binding is an import from `bun:test`
function bunTestBinding(sourceCode: SourceCode, node: ESTree.Node, name: string): Binding | null {
	const definition = findVariable(sourceCode, node, name)?.defs[0]

	if (
		definition?.type !== 'ImportBinding' ||
		definition.parent?.type !== 'ImportDeclaration' ||
		definition.parent.source.value !== source
	) {
		return null
	}

	const specifier = definition.node

	if (specifier.type === 'ImportNamespaceSpecifier') {
		return { kind: 'namespace' }
	}

	if (specifier.type === 'ImportSpecifier') {
		const { imported } = specifier

		return { kind: 'named', name: imported.type === 'Identifier' ? imported.name : imported.value }
	}

	return null
}

/**
 * The `bun:test` export a call starts from. `it.each([...])('name', fn)`, `describe.skip(...)` and `bt.describe(...)`
 * (with `import * as bt from 'bun:test'`) all resolve to the bare name. Returns null for anything else.
 */
export function bunTestCallee(
	sourceCode: SourceCode,
	callee: ESTree.Expression,
): BunTestReference | null {
	if (callee.type === 'Identifier') {
		const binding = bunTestBinding(sourceCode, callee, callee.name)

		return binding?.kind === 'named'
			? { name: binding.name, node: callee, viaNamespace: false }
			: null
	}

	if (callee.type === 'MemberExpression') {
		const { object, property } = callee

		if (
			object.type === 'Identifier' &&
			!callee.computed &&
			property.type === 'Identifier' &&
			bunTestBinding(sourceCode, object, object.name)?.kind === 'namespace'
		) {
			return { name: property.name, node: property, viaNamespace: true }
		}

		return bunTestCallee(sourceCode, object)
	}

	if (callee.type === 'CallExpression') {
		return bunTestCallee(sourceCode, callee.callee)
	}

	return null
}

/** Whether the file imports anything from `bun:test`. The rules that report arbitrary calls only run in such a file. */
export function importsBunTest(program: ESTree.Program): boolean {
	return program.body.some(
		(statement) => statement.type === 'ImportDeclaration' && statement.source.value === source,
	)
}

/**
 * The call a top-level expression statement makes, if it makes one. `await mock.module(...)` is a call too: awaiting it
 * does not make it declarative.
 */
export function topLevelCall(
	statement: ESTree.Directive | ESTree.Statement,
): ESTree.CallExpression | null {
	if (statement.type !== 'ExpressionStatement') {
		return null
	}

	let { expression } = statement

	while (expression.type === 'AwaitExpression') {
		expression = expression.argument
	}

	return expression.type === 'CallExpression' ? expression : null
}

/** The `bun:test` export each top-level call statement starts from, for the rules that check the top level. */
export function* topLevelBunTestCalls(
	sourceCode: SourceCode,
	program: ESTree.Program,
): Generator<{ name: string; statement: ESTree.Directive | ESTree.Statement }> {
	for (const statement of program.body) {
		const call = topLevelCall(statement)
		const reference = call === null ? null : bunTestCallee(sourceCode, call.callee)

		if (reference !== null) {
			yield { name: reference.name, statement }
		}
	}
}

/**
 * The local name `bun:test`'s `it` has at `node`, for fixes that rewrite `test` to `it`. Null when `it` is not imported
 * by name, or when the local name is shadowed there.
 */
export function localIt(
	sourceCode: SourceCode,
	program: ESTree.Program,
	node: ESTree.Node,
): string | null {
	for (const statement of program.body) {
		if (statement.type !== 'ImportDeclaration' || statement.source.value !== source) {
			continue
		}

		for (const specifier of statement.specifiers) {
			if (specifier.type !== 'ImportSpecifier') {
				continue
			}

			const { imported, local } = specifier
			const name = imported.type === 'Identifier' ? imported.name : imported.value
			const binding = name === 'it' ? bunTestBinding(sourceCode, node, local.name) : null

			if (binding?.kind === 'named' && binding.name === 'it') {
				return local.name
			}
		}
	}

	return null
}
