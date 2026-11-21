# bun:test/require-hook

Category: **Style**

## What it does

Reports setup at the top level of a `bun:test` spec:

- a call statement other than `describe`, `it`, `test` or a hook, such as `mock.module(...)`, `setDefaultTimeout(...)` or `resetDatabase()`, awaited or not;
- a declaration (`const`, `let` or `var`) initialised with a `bun:test` mock or spy: `spyOn(...)`, `mock(...)`, `mock.module(...)`, `jest.fn()` or `vi.fn()`.

These stay allowed:

- imports, exports, types and classes;
- plain declarations, even ones that call something, such as `const { db } = createTestDb()`;
- calls inside function bodies, such as a helper that returns `spyOn(...)`;
- `describe`, `it`, `test` and the hooks, which the plugin's other rules check.

The rule does nothing in a file that imports nothing from `bun:test`. Apart from that, the call statements it reports can come from anywhere; only the mock and spy factories in declarations have to be `bun:test` imports (see [import-source matching](../README.md#import-source-matching)). It checks the top level of the file only, not the bodies of `describe` blocks.

Oxlint's [`jest/require-hook`](https://oxc.rs/docs/guide/usage/linter/rules/jest/require-hook) is the Jest/Vitest counterpart. It also checks `describe` bodies and has an `allowedFunctionCalls` option.

## Why is this bad?

Top-level code in a spec runs once, when the file loads, before any test and outside every hook. A spy created there is shared by every test and never restored, so one test's calls leak into the next. A `mock.module(...)` there replaces the module for the whole file, with no `describe` to say which tests rely on it. Inside a hook, setup runs when and where the tests that need it run, and can be undone in the matching `after*` hook.

## Examples

Examples of **incorrect** code for this rule:

```ts
import { describe, it, mock, spyOn } from 'bun:test'

mock.module('./mailer.ts', () => ({ send: mock() }))
await mock.module('./clock.ts', () => ({ now: () => 0 }))

const warn = spyOn(console, 'warn')

resetDatabase()

describe('signup', () => {
	it('sends a welcome mail', () => {})
})
```

Examples of **correct** code for this rule:

```ts
import { afterEach, beforeEach, describe, it, mock, spyOn } from 'bun:test'

import { createTestDb } from './helpers.ts'

const { db } = createTestDb()

function stubWarn() {
	return spyOn(console, 'warn')
}

describe('signup', () => {
	beforeEach(() => {
		mock.module('./mailer.ts', () => ({ send: mock() }))
		db.reset()
	})

	afterEach(() => {
		mock.restore()
	})

	it('sends a welcome mail', () => {
		stubWarn()
	})
})
```

## Options

No options.

## How to use

To **enable** this rule, add the `bun:test` plugin and the rule to your config. The `bunTest` preset from `@configg/oxc/lint` already does this, with all five rules as errors:

```ts
import { bunTest, configs } from '@configg/oxc/lint'
// oxlint.config.ts
import { defineConfig } from 'oxlint'

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
		"bun:test/require-hook": "error",
	},
}
```

Run oxlint under Bun (`bunx --bun oxlint`): the plugin ships as TypeScript. JS plugins have no CLI flag, so the rule can only be enabled from a config file.

## References

- [Rule source](../../../src/bun-test/rules/require-hook.ts)
- [Tests](../../../test/bun-test/require-hook.spec.ts)
- [`jest/require-hook`](https://oxc.rs/docs/guide/usage/linter/rules/jest/require-hook), its Jest/Vitest counterpart
- [The `bun:test` plugin](../README.md)
