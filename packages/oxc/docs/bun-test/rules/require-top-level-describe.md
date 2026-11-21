# bun:test/require-top-level-describe

Category: **Style**

## What it does

Reports an `it(...)` or `test(...)` call, including `it.each(...)`, `it.skip(...)` and `await it(...)`, that is a statement at the top level of the file instead of sitting inside a `describe`.

Only calls of `bun:test` imports count, by their exported name: see [import-source matching](../README.md#import-source-matching).

Oxlint's [`jest/require-top-level-describe`](https://oxc.rs/docs/guide/usage/linter/rules/jest/require-top-level-describe) checks tests, hooks and the number of top-level `describe`s in one rule. This plugin splits those: this rule checks tests, [`no-top-level-hooks`](./no-top-level-hooks.md) checks hooks and [`single-top-level-describe`](./single-top-level-describe.md) checks the count.

## Why is this bad?

A test at the top level has no subject: its name has to say what it is about, and the hooks a `describe` sets up do not run for it. Putting every test inside the file's `describe` groups them under one name in the report and lets them share setup.

## Examples

Examples of **incorrect** code for this rule:

```ts
import { describe, it } from 'bun:test'

it('parses an empty string', () => {})

describe('parse', () => {
	it('parses a number', () => {})
})
```

Examples of **correct** code for this rule:

```ts
import { describe, it } from 'bun:test'

describe('parse', () => {
	it('parses an empty string', () => {})

	it('parses a number', () => {})
})
```

## Options

No options.

## How to use

To **enable** this rule, add the `bun:test` plugin and the rule to your config. The `bunTest` preset from `@configg/oxc/lint` already does this, with all five rules as errors:

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
	"jsPlugins": ["./node_modules/@configg/oxc/src/bun-test/index.ts"],
	"rules": {
		"bun:test/require-top-level-describe": "error",
	},
}
```

Run oxlint under Bun (`bunx --bun oxlint`): the plugin ships as TypeScript. JS plugins have no CLI flag, so the rule can only be enabled from a config file.

## References

- [Rule source](../../../src/bun-test/rules/require-top-level-describe.ts)
- [Tests](../../../test/bun-test/require-top-level-describe.spec.ts)
- [`jest/require-top-level-describe`](https://oxc.rs/docs/guide/usage/linter/rules/jest/require-top-level-describe), its Jest/Vitest counterpart
- [The `bun:test` plugin](../README.md)
