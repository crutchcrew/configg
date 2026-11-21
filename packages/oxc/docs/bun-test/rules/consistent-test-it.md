# bun:test/consistent-test-it

Category: **Style** · 🛠️ An auto-fix is available for this rule.

## What it does

Reports every `test(...)` call from `bun:test`, at any depth, including `test.each(...)`, `test.skip(...)`, `test.todo(...)` and `test.if(...)`. Write `it(...)` instead.

Only calls of `bun:test` imports count, by their exported name: see [import-source matching](../README.md#import-source-matching). A `test.each([...])('name', fn)` call is reported once, at the inner `test.each(...)`.

The fix renames the call to `it` when it can do so safely:

- through a namespace import, `bt.test(...)` becomes `bt.it(...)`;
- for a named import, `test(...)` becomes `it(...)` (or whatever local name `it` is imported under) only if `it` is imported from `bun:test` in the same file and not shadowed at the call. The fix leaves the `test` import in place; remove it once it is unused.

Oxlint's [`jest/consistent-test-it`](https://oxc.rs/docs/guide/usage/linter/rules/jest/consistent-test-it) does the same for Jest and Vitest, with options to choose `it` or `test`. This rule always wants `it`.

## Why is this bad?

`it` and `test` are the same function in `bun:test`. Mixing them makes a file read two ways for no reason. `it` reads as a sentence about behaviour (`it('rejects an empty cart')`), which is what a spec describes, so every spec in a codebase uses it.

## Examples

Examples of **incorrect** code for this rule:

```ts
import { describe, it, test } from 'bun:test'

describe('cart', () => {
	test('rejects an empty cart', () => {})

	test.each([1, 2])('accepts %d items', () => {})
})
```

Examples of **correct** code for this rule:

```ts
import { describe, it } from 'bun:test'

describe('cart', () => {
	it('rejects an empty cart', () => {})

	it.each([1, 2])('accepts %d items', () => {})
})
```

## Options

No options.

## How to use

To **enable** this rule, add the `bun:test` plugin and the rule to an override for your spec files. The `bunTest` preset from `@configg/oxc/lint` already does this, with all five rules as errors:

```ts
// oxlint.config.ts
import { defineConfig } from 'oxlint'
import { bunTest, configs } from '@configg/oxc/lint'

export default defineConfig({
	...configs.client,
	extends: [bunTest],
})
```

To enable this rule alone:

```jsonc
// .oxlintrc.json
{
	"overrides": [
		{
			"files": ["**/*.spec.{ts,tsx}"],
			"jsPlugins": ["./node_modules/@configg/oxc/src/bun-test/index.ts"],
			"rules": {
				"bun:test/consistent-test-it": "error",
			},
		},
	],
}
```

Run oxlint under Bun (`bunx --bun oxlint`): the plugin ships as TypeScript. JS plugins have no CLI flag, so the rule can only be enabled from a config file.

## References

- [Rule source](../../../src/bun-test/rules/consistent-test-it.ts)
- [Tests](../../../test/bun-test/consistent-test-it.spec.ts)
- [`jest/consistent-test-it`](https://oxc.rs/docs/guide/usage/linter/rules/jest/consistent-test-it), its Jest/Vitest counterpart
- [The `bun:test` plugin](../README.md)
