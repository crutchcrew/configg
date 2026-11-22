# `bun:test` plugin

An Oxlint JS plugin for the layout of specs written with Bun's test runner, [`bun:test`](https://bun.com/docs/test).
It ships in `@configg/oxc` (and `@configg/bases`) as the `bunTest` preset.

## What the plugin is for

A `bun:test` spec built to this plugin's rules has one shape: imports, constants and helper functions at the top level, then one `describe` that holds every test, hook and mock.

```ts
import { beforeEach, describe, expect, it, mock, spyOn } from 'bun:test'

import { createTestDb } from './helpers.ts'

const { db } = createTestDb()

function seed(): void {
	db.insert({ id: 1 })
}

describe('orders', () => {
	beforeEach(() => {
		mock.module('./mailer.ts', () => ({ send: mock() }))
		spyOn(console, 'warn')
		seed()
	})

	it('lists orders', () => {
		expect(db.all()).toHaveLength(1)
	})
})
```

Every rule reports something that breaks that shape: `test(...)` instead of `it(...)`, a test or hook outside the `describe`, setup at the top level, or a second top-level `describe`.

## Why the built-in `jest` and `vitest` rules miss `bun:test`

Oxlint's `jest` and `vitest` plugins already have rules for this, such as [`consistent-test-it`](https://oxc.rs/docs/guide/usage/linter/rules/jest/consistent-test-it), [`require-top-level-describe`](https://oxc.rs/docs/guide/usage/linter/rules/jest/require-top-level-describe) and [`require-hook`](https://oxc.rs/docs/guide/usage/linter/rules/jest/require-hook). They recognise `describe`, `it`, `test` and the hooks only when those names are globals or are imported from `vitest` or `@jest/globals`. A spec that imports them from `bun:test` looks to them like a file with no tests at all, so they report nothing:

```ts
import { beforeEach, test } from 'bun:test'

beforeEach(() => {}) // jest/require-top-level-describe: no report
test('works', () => {}) // jest/require-top-level-describe: no report
```

This plugin's rules read those imports instead.

### Import-source matching

The rules match a name by what it is bound to, not by how it is spelled:

- A named import from `bun:test` counts under its exported name, so `import { it as spec } from 'bun:test'` makes `spec(...)` an `it` and `import { test as check } from 'bun:test'` makes `check(...)` a `test`.
- A member of a namespace import counts: with `import * as bt from 'bun:test'`, `bt.describe(...)` is a `describe`.
- Chained calls start from their root name: `it.each([...])('name', fn)`, `describe.skip(...)` and `test.if(ok)(...)` are all calls of the bare name.
- Anything else does not count: a global `describe`, an import from `vitest` or another module, or a local variable or parameter that shadows the import.

There is no option to match globals. A spec that relies on Bun's injected globals instead of importing from `bun:test` is the case the built-in `jest`/`vitest` rules already cover, so use those for it. Every rule does nothing in a file with no `bun:test` import.

## How to use

`bunTest` from `@configg/oxc/lint` (or `@configg/bases/oxlint`) is a preset: the plugin and its five rules as errors. Add it to `extends` after a base preset:

```ts
// oxlint.config.ts

import { antiSlop, bunTest, configs } from '@configg/oxc/lint'
import { defineConfig } from 'oxlint'

export default defineConfig({
	extends: [configs.client, antiSlop, bunTest],
})
```

To turn a rule off, set it in your own `rules`, which apply after the ones from `extends`:

```ts
export default defineConfig({
	extends: [configs.client, bunTest],
	rules: { 'bun:test/require-hook': 'off' },
})
```

The plugin ships as TypeScript, so run oxlint under Bun (`bunx --bun oxlint`): Node refuses to strip types from files in `node_modules`. JS plugins can only be enabled from a config file; oxlint has no CLI flag for them.

To pick rules one by one, list the plugin and the rules you want. The plugin's name is `bun:test`, so its rule ids are `bun:test/<rule>`, and so are disable comments (`// oxlint-disable-next-line bun:test/require-hook`).

```jsonc
// .oxlintrc.json
{
	"jsPlugins": ["./node_modules/@configg/oxc/src/bun-test/index.ts"],
	"rules": {
		"bun:test/consistent-test-it": "error",
		"bun:test/require-top-level-describe": "error",
	},
}
```

### Which files it checks

`bunTest` has no file glob. Every rule skips a file that imports nothing from `bun:test`, so the preset applies to every file that does, whatever it is named: `*.spec.ts`, `*.test.ts`, files under `__tests__/`. Two things follow from that:

- **Setup files that import `bun:test` are checked too.** A [preload file](https://bun.com/docs/test/lifecycle) (`[test] preload` in `bunfig.toml`) holds global hooks and module mocks on purpose, so `no-top-level-hooks` and `require-hook` report it. Turn those two off for it:

  ```ts
  export default defineConfig({
  	extends: [configs.client, bunTest],
  	overrides: [
  		{
  			files: ['test/setup.ts'],
  			rules: { 'bun:test/no-top-level-hooks': 'off', 'bun:test/require-hook': 'off' },
  		},
  	],
  })
  ```

- **Oxlint passes every file to the plugin.** JS plugin rules run for every file the config covers, not only test files. The rules return as soon as they see no `bun:test` import, but oxlint still hands each file to the JS side, which costs a little per file. If `antiSlop` is on, both plugins share that hand-off and `bunTest` only adds its import check. To limit the plugin to test files instead, put its plugin and rules in an override:

  ```ts
  export default defineConfig({
  	extends: [configs.client],
  	overrides: [{ files: ['**/*.spec.{ts,tsx}'], ...bunTest }],
  })
  ```

  A rule enabled inside an override is only turned off by a later override, not by top-level `rules`.

## Rules

All five rules are errors in `bunTest`. Oxlint does not enable JS plugin rules by category; the category is the one the rule's `jest` counterpart has.

| Rule                                                                  | Category | Fixable | Reports                                                                                              |
| --------------------------------------------------------------------- | -------- | ------- | ---------------------------------------------------------------------------------------------------- |
| [`consistent-test-it`](./rules/consistent-test-it.md)                 | Style    | 🛠️ Yes  | `test(...)` or `test.each(...)` anywhere: write `it(...)`                                            |
| [`require-top-level-describe`](./rules/require-top-level-describe.md) | Style    | No      | an `it` or `test` call at the top level of the file                                                  |
| [`no-top-level-hooks`](./rules/no-top-level-hooks.md)                 | Style    | No      | `beforeAll`, `beforeEach`, `afterAll` or `afterEach` at the top level of the file                    |
| [`require-hook`](./rules/require-hook.md)                             | Style    | No      | any other call statement at the top level, or a top-level declaration initialised with a mock or spy |
| [`single-top-level-describe`](./rules/single-top-level-describe.md)   | Style    | No      | every top-level `describe` after the first                                                           |

`consistent-test-it` fixes `test` to `it` when `it` is imported from `bun:test` in the same file, or when the call goes through a namespace import.

## Naming

The plugin is named after the module it lints, `bun:test`. Oxlint accepts the colon in a JS plugin name, in rule ids and in disable comments. Each rule takes the name of its oxlint `jest`/`vitest` counterpart where it has one. `jest/require-top-level-describe` checks tests, hooks and the number of top-level `describe`s in one rule; here those are three rules, so the test check keeps the name and the other two are `no-top-level-hooks` and `single-top-level-describe`.
