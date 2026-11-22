# @configg/oxc

[![npm version](https://img.shields.io/npm/v/@configg/oxc)](https://www.npmjs.com/package/@configg/oxc)
[![license](https://img.shields.io/npm/l/@configg/oxc)](./LICENSE)

[`oxfmt`](https://oxc.rs/docs/guide/usage/formatter) and [`oxlint`](https://oxc.rs/docs/guide/usage/linter) presets.

```sh
bun add -d @configg/oxc oxfmt oxlint oxlint-tsgolint
```

## Formatter

`@configg/oxc/fmt` exports `configs`, a record of presets. Each one is a plain config object: pass it to oxfmt's `defineConfig()`, spread it, or call `.with()` on it to change some fields (see [Overriding a preset](#overriding-a-preset)).

```ts
// oxfmt.config.ts

import { configs } from '@configg/oxc/fmt'
import { defineConfig } from 'oxfmt'

export default defineConfig(configs.client)
```

- `client`: the shared base plus Tailwind class sorting (`class`, `className`, `cx`, `createVariants`) and import grouping: `react`, built-ins, packages, internal paths, `components`, `utils`, relative paths, styles, then anything else.
- `scripts`: the shared base plus import grouping, for tooling and config files.
- `server`: the same as `scripts`.

Import grouping, in order:

- **Built-ins:** `node:*`, bare Node built-ins such as `path`, `bun:*`, and bare `bun`. oxfmt counts bare `bun` as a package, so the presets add a `bun` group that sorts with the built-ins.
- **Packages.**
- **Internal paths:** `#/…` [subpath imports](https://nodejs.org/api/packages.html#subpath-imports) and the `~/`, `@/` and `#` prefixes.
- **Relative paths:** `../` and `./`.
- **Style imports.**
- **Anything else.**

`client` puts `react` first, and `components` and `utils` paths after the internal ones. A blank line separates each group. Side-effect imports such as `import './global.css'` stay where they are, since oxfmt doesn't move them.

## Linter

`@configg/oxc/lint` exports two base presets in `configs` and four add-on presets. List a base preset first in `extends`, then the add-ons you want:

```ts
// oxlint.config.ts

import { configs, react, vitest } from '@configg/oxc/lint'
import { defineConfig } from 'oxlint'

export default defineConfig({
	extends: [configs.client, react, vitest],
})
```

Base presets, in `configs`:

- `client`: browser env, type-aware, with rules relaxed for component code.
- `scripts`: Node env, type-aware, for tooling and config files.

Add-on presets, each listed after a base preset:

- `react`: the React plugin, React rule settings and a `**/*.tsx` override.
- `vitest`: the Vitest env, Vitest rules and Testing Library rules for `**/*.spec.{ts,tsx}` files. Needs `eslint-plugin-testing-library`.
- `antiSlop`: the anti-slop plugin. See below.
- `bunTest`: the `bun:test` plugin. See below.

Before 0.1.17, `configs.client` included React and Vitest. Add `react` and `vitest` to keep that behaviour.

The Oxlint presets don't enable anti-slop. `antiSlop` from `@configg/oxc/lint` is an opt-in set with the plugin and all 18 rules as errors; `unicorn/prefer-reflect-apply` is off. See [UPSTREAM.md](./src/anti-slop/UPSTREAM.md) for its source and update policy.

```ts
import { antiSlop, configs } from '@configg/oxc/lint'

export default defineConfig({
	extends: [configs.client, antiSlop],
})
```

The plugin ships as TypeScript, so run oxlint under Bun (`bunx --bun oxlint`): Node refuses to strip types from files in `node_modules`.

### `bun:test` plugin

`bunTest` from `@configg/oxc/lint` is an opt-in preset for `bun:test` specs: the `bun:test` plugin and its five rules as errors. Oxlint's built-in `jest` and `vitest` rules don't recognise `describe`, `it` or the hooks when they're imported from `bun:test`; these rules do. They hold a spec to one shape: imports, constants and helpers, then one `describe` holding every test, hook and mock.

```ts
import { bunTest, configs } from '@configg/oxc/lint'

export default defineConfig({
	extends: [configs.client, bunTest],
})
```

It has no file glob: each rule skips files that import nothing from `bun:test`, so any test file name works. Two caveats follow, both covered in [the plugin docs](./docs/bun-test/README.md#which-files-it-checks): a Bun preload file that imports `bun:test` gets checked too (turn `no-top-level-hooks` and `require-hook` off for it), and oxlint passes every file to the plugin. Like anti-slop, the plugin ships as TypeScript, so run oxlint under Bun.

| Rule                                                                                         | Fixable | Reports                                                                                |
| -------------------------------------------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------- |
| [`bun:test/consistent-test-it`](./docs/bun-test/rules/consistent-test-it.md)                 | Yes     | `test(...)` or `test.each(...)`: write `it(...)`                                       |
| [`bun:test/require-top-level-describe`](./docs/bun-test/rules/require-top-level-describe.md) | No      | a test at the top level of the file                                                    |
| [`bun:test/no-top-level-hooks`](./docs/bun-test/rules/no-top-level-hooks.md)                 | No      | a hook at the top level of the file                                                    |
| [`bun:test/require-hook`](./docs/bun-test/rules/require-hook.md)                             | No      | other top-level calls, such as `mock.module(...)`, and top-level `spyOn`/`mock` values |
| [`bun:test/single-top-level-describe`](./docs/bun-test/rules/single-top-level-describe.md)   | No      | a second top-level `describe`                                                          |

The rules match names by their `bun:test` import, so renamed and namespace imports count and globals don't. See [the plugin docs](./docs/bun-test/README.md) for the details and per-rule pages.

### Composing presets

Every preset is a whole Oxlint config, so they all go in `extends`: a base preset first, then add-ons. Later entries win where they set the same rule, and your own config wins over all of them:

```ts
import { antiSlop, bunTest, configs } from '@configg/oxc/lint'

export default defineConfig({
	extends: [configs.client, antiSlop, bunTest],
	rules: { 'bun:test/require-hook': 'off' },
})
```

Oxlint's `extends` passes on `rules`, `categories`, `plugins`, `jsPlugins`, `options` and every `overrides` entry, but drops a top-level `env` or `globals`. The base presets set their environment in a catch-all `files: ['**/*']` override, so it survives. Nothing has to be repeated at the top of your config: `options` (`typeAware`, `typeCheck`) comes through too. Set your own `ignorePatterns` and `settings` at the top of your config as usual. A top-level `env` or `globals` there adds to a base preset's environment but can't take anything away from it, because the preset's override applies after it. That holds when you spread a preset too. To switch part of the environment off, use an override of your own:

```ts
export default defineConfig({
	extends: [configs.client],
	// Node globals on top of the browser env
	env: { node: true },
	// No browser globals in server code
	overrides: [{ files: ['src/server/**'], env: { browser: false } }],
})
```

Your top-level `rules` turn off a rule a preset sets at its top level, but not one it sets inside an override, such as `vitest`'s spec-file rules or `react`'s `*.tsx` rules. For those, add an override of your own, which applies after the presets':

```ts
export default defineConfig({
	extends: [configs.client, react, vitest],
	overrides: [
		{ files: ['**/*.spec.{ts,tsx}'], rules: { 'testing-library/no-node-access': 'off' } },
	],
})
```

Spreading a preset still works (`{ ...configs.client }`). If you also set `overrides`, include `...configs.client.overrides`, or the environment goes with them.

To change a preset rather than add to it, call `.with()` on it in `extends`: `extends: [configs.client, bunTest.with({ rules: { 'bun:test/require-hook': 'off' } })]`. See [Overriding a preset](#overriding-a-preset).

Both presets allow up to two classes per file, allow `forEach()` and `reduce()`, allow `process.exit()` (CLI scripts and
shutdown handlers exit with a status code on purpose) and allow short identifiers (`eslint/id-length` is off). They turn `import/prefer-default-export` off, since named
exports are the convention (it matters once a config adds the `import` plugin), `unicorn/import-style` off, since named
imports such as `import { join } from 'node:path'` are the convention, and `unicorn/number-literal-case`
off, since oxfmt and Prettier write hex digits in lowercase. `async`/`await` is allowed (`oxc/no-async-await` is
off), an `async` function needs no `await` (`eslint/require-await` and `typescript/require-await` are off, since
`typescript/promise-function-async` makes every promise-returning function `async`), `continue` is allowed (`eslint/no-continue` is off), and functions may run to 100 lines (blank lines and comments
not counted) and 30 statements. Template expressions
allow booleans, numbers, nullish values and `never`; other types follow Oxlint's defaults.

Both presets set `eslint/capitalized-comments` to require a capital only on the first line of a wrapped `//` comment (`ignoreConsecutiveComments`). They also skip tool pragmas that have to stay lowercase: `svelte-ignore`, `biome-ignore`, `c8 ignore`, `v8 ignore`, `cspell:`, `noinspection` and webpack magic comments such as `webpackChunkName`. Oxlint already skips its own and ESLint's directives, `prettier-ignore`, `istanbul` and `jshint`.

Both presets turn `eslint/init-declarations` off. It asks for `let x = undefined`, which `unicorn/no-useless-undefined` rejects, so no form of "declare now, assign later" passed both. For a variable with no meaningful starting value, write `let x: T | undefined`.

Both presets make two `pedantic` rules errors rather than warnings: `eslint/eqeqeq` requires `===` and `!==`, and
`typescript/strict-boolean-expressions` keeps its default options: conditions may be booleans, strings, numbers or
nullable objects, but not `any` or a broad nullable primitive such as `boolean | undefined` or `string | undefined`, so
those conditions have to handle the nullish case explicitly.

## Overriding a preset

Every preset and add-on (`configs.client`, `configs.scripts` and `configs.server` from `/fmt`; `configs.client`, `configs.scripts`, `react`, `vitest`, `antiSlop` and `bunTest` from `/lint`) has a `.with(overrides)` method. It returns the preset with `overrides` deep-merged into it, so you write only what differs:

```ts
import { configs as fmt } from '@configg/oxc/fmt'

// Spread: copy the preset, then copy the nested object again to change one field
const spread = {
	...fmt.client,
	sortTailwindcss: { ...fmt.client.sortTailwindcss, stylesheet: './src/main.css' },
}

// Call: the same config
const called = fmt.client.with({ sortTailwindcss: { stylesheet: './src/main.css' } })
```

How the overrides merge:

- **Plain objects merge** key by key, at any depth. Overriding `sortTailwindcss.stylesheet` keeps `sortTailwindcss.attributes` and `functions`; overriding one rule in `rules` keeps every other rule.
- **Arrays replace** the preset's array; they don't concatenate. `{ sortTailwindcss: { functions: [] } }` clears the list, and `extends`, `plugins`, `jsPlugins` and a rule's `['warn', { … }]` setting are replaced whole. So is `overrides`: the base lint presets keep their environment in an override, so `configs.client.with({ overrides: […] })` drops the browser env unless you include `...configs.client.overrides`. To add overrides, put them at the top of your own config instead.
- **Everything else replaces**: strings, numbers, booleans and `null`. A plain object over a non-object, or the other way round, replaces it too: `{ sortTailwindcss: false }` turns sorting off.
- **`undefined` keeps** the preset's value, so `{ semi: undefined }` changes nothing.

`.with()` never changes the preset. It returns a new preset, so calls chain (`fmt.client.with(a).with(b)`). Its argument is typed as a deep partial of `OxfmtConfig` or `OxlintConfig`, so a misspelled or mistyped key is a type error, and its return type is the full config type. Arrays in the argument are typed whole, since they replace.

`with` is a non-enumerable property. Spreading, `JSON.stringify` and `structuredClone` see only the config's fields, and a preset is still a plain object wherever oxfmt, oxlint and Vite+ expect one: `defineConfig(configs.client)`, `fmt: configs.scripts`, `extends: [configs.client, antiSlop]`, or `options: fmt.client.with({ … })` in an oxfmt override.

`@configg/prettier` presets work differently: you call the preset itself, and its arrays concatenate so that `plugins` accumulate. See [its README](../prettier/README.md).

## Peer dependencies

`oxfmt`, `oxlint`, `oxlint-tsgolint` and `eslint-plugin-testing-library` (for the `vitest` add-on) are all optional peers, so you install only the ones the presets you use need.
