# bun:test/no-top-level-hooks

Category: **Style**

## What it does

Reports `beforeAll(...)`, `beforeEach(...)`, `afterAll(...)` or `afterEach(...)` called at the top level of the file. Scope each hook to the `describe` whose tests need it.

Only calls of `bun:test` imports count, by their exported name: see [import-source matching](../README.md#import-source-matching).

This is the hook half of oxlint's [`jest/require-top-level-describe`](https://oxc.rs/docs/guide/usage/linter/rules/jest/require-top-level-describe), which has no rule of its own for it.

## Why is this bad?

A top-level hook runs around every test in the file, including tests added later that do not need it. Inside a `describe`, a hook says which tests it serves, and moving or deleting those tests takes the hook with them.

## Examples

Examples of **incorrect** code for this rule:

```ts
import { beforeEach, describe, it } from 'bun:test'

beforeEach(() => {
	reset()
})

describe('queue', () => {
	it('starts empty', () => {})
})
```

Examples of **correct** code for this rule:

```ts
import { beforeEach, describe, it } from 'bun:test'

describe('queue', () => {
	beforeEach(() => {
		reset()
	})

	it('starts empty', () => {})
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
				"bun:test/no-top-level-hooks": "error",
			},
		},
	],
}
```

Run oxlint under Bun (`bunx --bun oxlint`): the plugin ships as TypeScript. JS plugins have no CLI flag, so the rule can only be enabled from a config file.

## References

- [Rule source](../../../src/bun-test/rules/no-top-level-hooks.ts)
- [Tests](../../../test/bun-test/no-top-level-hooks.spec.ts)
- [`jest/require-top-level-describe`](https://oxc.rs/docs/guide/usage/linter/rules/jest/require-top-level-describe), whose hook check this is
- [The `bun:test` plugin](../README.md)
