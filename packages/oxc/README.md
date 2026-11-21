# @configg/oxc

[![npm version](https://img.shields.io/npm/v/@configg/oxc)](https://www.npmjs.com/package/@configg/oxc)
[![license](https://img.shields.io/npm/l/@configg/oxc)](./LICENSE)

[`oxfmt`](https://oxc.rs/docs/guide/usage/formatter) and [`oxlint`](https://oxc.rs/docs/guide/usage/linter) presets.

```sh
bun add -d @configg/oxc oxfmt oxlint oxlint-tsgolint
```

## Formatter

`@configg/oxc/fmt` exports `configs`, a record of plain config objects. Pass one to oxfmt's `defineConfig()`.

```ts
// oxfmt.config.ts
import { defineConfig } from 'oxfmt'
import { configs } from '@configg/oxc/fmt'

export default defineConfig(configs.client)
```

- `client`: the shared base plus Tailwind class sorting (`class`, `className`, `cx`, `createVariants`) and import grouping (`react`, external, `components`, `utils`, relative).
- `scripts`: the shared base, for tooling and config files.
- `server`: the shared base.

## Linter

`@configg/oxc/lint` exports `configs`. Pass one to oxlint's `defineConfig()`.

```ts
// oxlint.config.ts
import { defineConfig } from 'oxlint'
import { configs } from '@configg/oxc/lint'

export default defineConfig(configs.client)
```

- `client`: browser env, type-aware, with rules relaxed for component code. Its `**/*.spec.{ts,tsx}` override enables the Vitest env and Testing Library rules, so it needs `eslint-plugin-testing-library`.
- `scripts`: Node env, type-aware, for tooling and config files.

The Oxlint presets don't enable anti-slop. `antiSlop` from `@configg/oxc/lint` is an opt-in set with the plugin and all 18 rules as errors; `unicorn/prefer-reflect-apply` is off. See [UPSTREAM.md](./src/anti-slop/UPSTREAM.md) for its source and update policy.

```ts
import { antiSlop, configs } from '@configg/oxc/lint'

export default defineConfig({
	...configs.client,
	extends: [antiSlop],
})
```

The plugin ships as TypeScript, so run oxlint under Bun (`bunx --bun oxlint`): Node refuses to strip types from files in `node_modules`.

### `bun:test` plugin

`bunTest` from `@configg/oxc/lint` is an opt-in preset for `bun:test` specs: the `bun:test` plugin and its five rules as errors, in an override for `**/*.spec.{ts,tsx}`. Oxlint's built-in `jest` and `vitest` rules don't recognise `describe`, `it` or the hooks when they're imported from `bun:test`; these rules do. They hold a spec to one shape: imports, constants and helpers, then one `describe` holding every test, hook and mock.

```ts
import { bunTest, configs } from '@configg/oxc/lint'

export default defineConfig({
	...configs.client,
	extends: [bunTest],
})
```

For other spec names, extend a copy with new `files`: `extends: [{ overrides: [{ ...bunTest.overrides[0], files: ['**/*.test.ts'] }] }]`. Like anti-slop, the plugin ships as TypeScript, so run oxlint under Bun.

| Rule                                                                                         | Fixable | Reports                                                                                |
| -------------------------------------------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------- |
| [`bun:test/consistent-test-it`](./docs/bun-test/rules/consistent-test-it.md)                 | Yes     | `test(...)` or `test.each(...)`: write `it(...)`                                       |
| [`bun:test/require-top-level-describe`](./docs/bun-test/rules/require-top-level-describe.md) | No      | a test at the top level of the file                                                    |
| [`bun:test/no-top-level-hooks`](./docs/bun-test/rules/no-top-level-hooks.md)                 | No      | a hook at the top level of the file                                                    |
| [`bun:test/require-hook`](./docs/bun-test/rules/require-hook.md)                             | No      | other top-level calls, such as `mock.module(...)`, and top-level `spyOn`/`mock` values |
| [`bun:test/single-top-level-describe`](./docs/bun-test/rules/single-top-level-describe.md)   | No      | a second top-level `describe`                                                          |

The rules match names by their `bun:test` import, so renamed and namespace imports count and globals don't. See [the plugin docs](./docs/bun-test/README.md) for the details and per-rule pages.

### Composing presets

`antiSlop` and `bunTest` are add-on presets: whole Oxlint configs that go in `extends`. Spread the base preset (`configs.client` or `configs.scripts`) at the top of your config and list the add-ons in `extends`:

```ts
import { antiSlop, bunTest, configs } from '@configg/oxc/lint'

export default defineConfig({
	...configs.client,
	extends: [antiSlop, bunTest],
})
```

Spread the base preset rather than putting it in `extends`: Oxlint's `extends` passes on `rules`, `categories`, `plugins`, `jsPlugins`, `overrides` and `options`, but not `env` or `globals`, so a base preset in `extends` loses its browser or Node globals.

To turn off a rule an add-on enables in an override (all of `bunTest`'s rules), turn it off in an override of your own. A top-level `rules` entry is not enough, because a matching override applies after the top-level rules:

```ts
export default defineConfig({
	...configs.client,
	extends: [bunTest],
	// Has no effect on spec files: bunTest's override sets the rule to 'error' after this runs
	rules: { ...configs.client.rules, 'bun:test/require-hook': 'off' },
	// Works: your own overrides apply after the ones from `extends`
	overrides: [
		...configs.client.overrides,
		{ files: ['**/*.spec.{ts,tsx}'], rules: { 'bun:test/require-hook': 'off' } },
	],
})
```

Both presets allow up to two classes per file, allow `forEach()` and `reduce()`, allow `process.exit()` (CLI scripts and
shutdown handlers exit with a status code on purpose) and allow short identifiers (`eslint/id-length` is off). They turn `import/prefer-default-export` off, since named
exports are the convention (it matters once a config adds the `import` plugin), `unicorn/import-style` off, since named
imports such as `import { join } from 'node:path'` are the convention, and `unicorn/number-literal-case`
off, since oxfmt and Prettier write hex digits in lowercase. `async`/`await` is allowed (`oxc/no-async-await` is
off), an `async` function needs no `await` (`eslint/require-await` and `typescript/require-await` are off, since
`typescript/promise-function-async` makes every promise-returning function `async`), `continue` is allowed (`eslint/no-continue` is off), and functions may run to 100 lines (blank lines and comments
not counted) and 30 statements. Template expressions
allow booleans, numbers, nullish values and `never`; other types follow Oxlint's defaults.

Both presets make two `pedantic` rules errors rather than warnings: `eslint/eqeqeq` requires `===` and `!==`, and
`typescript/strict-boolean-expressions` keeps its default options: conditions may be booleans, strings, numbers or
nullable objects, but not `any` or a broad nullable primitive such as `boolean | undefined` or `string | undefined`, so
those conditions have to handle the nullish case explicitly.

## Peer dependencies

`oxfmt`, `oxlint`, `oxlint-tsgolint` and `eslint-plugin-testing-library` are all optional peers, so you install only the ones the presets you use need.
