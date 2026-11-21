# bun:test/single-top-level-describe

Category: **Style**

## What it does

Reports every top-level `describe(...)` after the first, including `describe.skip(...)`, `describe.only(...)` and `describe.each(...)(...)`. A spec has one top-level `describe`, and the others nest inside it.

Only calls of `bun:test` imports count, by their exported name: see [import-source matching](../README.md#import-source-matching). A file with no top-level `describe` is not reported by this rule; [`require-top-level-describe`](./require-top-level-describe.md) reports its tests.

This is oxlint's [`jest/require-top-level-describe`](https://oxc.rs/docs/guide/usage/linter/rules/jest/require-top-level-describe) with `maxNumberOfTopLevelDescribes: 1`, as a rule of its own.

## Why is this bad?

A spec file is about one unit, and its top-level `describe` names it. Several top-level `describe`s split the file into unrelated groups that cannot share setup, and usually mean either that the file tests two things or that the groups belong under one name.

## Examples

Examples of **incorrect** code for this rule:

```ts
import { describe, it } from 'bun:test'

describe('parse', () => {
	it('parses a number', () => {})
})

describe('parse errors', () => {
	it('rejects a letter', () => {})
})
```

Examples of **correct** code for this rule:

```ts
import { describe, it } from 'bun:test'

describe('parse', () => {
	it('parses a number', () => {})

	describe('errors', () => {
		it('rejects a letter', () => {})
	})
})
```

## Options

No options.

## How to use

To **enable** this rule, add the `bun:test` plugin and the rule to an override for your spec files. `bunTest` from `@configg/oxc/lint` already does this, with all five rules as errors:

```ts
// oxlint.config.ts
import { defineConfig } from 'oxlint'
import { bunTest } from '@configg/oxc/lint'

export default defineConfig({
	overrides: [bunTest],
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
				"bun:test/single-top-level-describe": "error",
			},
		},
	],
}
```

Run oxlint under Bun (`bunx --bun oxlint`): the plugin ships as TypeScript. JS plugins have no CLI flag, so the rule can only be enabled from a config file.

## References

- [Rule source](../../../src/bun-test/rules/single-top-level-describe.ts)
- [Tests](../../../test/bun-test/single-top-level-describe.spec.ts)
- [`jest/require-top-level-describe`](https://oxc.rs/docs/guide/usage/linter/rules/jest/require-top-level-describe), whose `maxNumberOfTopLevelDescribes` option this is
- [The `bun:test` plugin](../README.md)
