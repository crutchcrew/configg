# configg ⚙️

[![CI](https://github.com/crutchcrew/configg/actions/workflows/ci.yml/badge.svg)](https://github.com/crutchcrew/configg/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@configg/bases)](https://www.npmjs.com/package/@configg/bases)
[![provenance](https://img.shields.io/badge/provenance-verified-brightgreen)](https://www.npmjs.com/package/@configg/bases)
[![license](https://img.shields.io/github/license/crutchcrew/configg)](./LICENSE)

Shared configuration presets for typescript tooling. One package per tool, or all of them in a single install.

The presets ship as TypeScript and JSON source. There is no build step, so use them from a runtime or tool that can load `.ts` files from `node_modules` (Bun, or the tool's own loader).

## Packages

| Package                                    | Version                                                                                                   | What it configures                                          |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| [`@configg/oxc`](./packages/oxc)           | [![npm](https://img.shields.io/npm/v/@configg/oxc)](https://www.npmjs.com/package/@configg/oxc)           | `oxfmt` (`/fmt`) and `oxlint` (`/lint`) presets             |
| [`@configg/prettier`](./packages/prettier) | [![npm](https://img.shields.io/npm/v/@configg/prettier)](https://www.npmjs.com/package/@configg/prettier) | Prettier presets and `combine()`                            |
| [`@configg/tsconfig`](./packages/tsconfig) | [![npm](https://img.shields.io/npm/v/@configg/tsconfig)](https://www.npmjs.com/package/@configg/tsconfig) | Strictest `tsconfig` presets for Bun and Vite               |
| `@configg/bases` (this repo's root)        | [![npm](https://img.shields.io/npm/v/@configg/bases)](https://www.npmjs.com/package/@configg/bases)       | All of the above under one name, straight from `packages/*` |

Install only what you use, or install `@configg/bases` and import everything from it:

| `@configg/bases/…`           | Same as                               |
| ---------------------------- | ------------------------------------- |
| `oxfmt`                      | `@configg/oxc/fmt`                    |
| `oxlint`                     | `@configg/oxc/lint`                   |
| `prettier`                   | `@configg/prettier`                   |
| `tsconfig/{bun,client,vite}` | `@configg/tsconfig/{bun,client,vite}` |

## Usage

Tools are `peerDependencies`: you install `oxfmt`, `oxlint`, `prettier` and `typescript` yourself and pin the versions you want, plus the Prettier plugins of the presets you compose. The packages only supply the presets.

```sh
bun add -d @configg/bases oxfmt oxlint oxlint-tsgolint typescript
```

```ts
// oxfmt.config.ts

import { configs } from '@configg/bases/oxfmt'
import { defineConfig } from 'oxfmt'

export default defineConfig(configs.client)
```

```ts
// oxlint.config.ts

import { configs } from '@configg/bases/oxlint'
import { defineConfig } from 'oxlint'

export default defineConfig(configs.client)
```

```jsonc
// tsconfig.json
{ "extends": "@configg/bases/tsconfig/client" }
```

Installing a single package works the same way, for example `@configg/oxc/fmt` and `@configg/oxc/lint`.

### Presets

- `oxfmt` exports `configs`: `client` (Tailwind class sorting, import grouping with `react`, `components` and `utils` groups), `scripts` (shared base with import grouping, for tooling and config files) and `server` (same as `scripts`). Built-ins, including `bun` and `bun:*`, come first (after `react` in `client`), then packages, internal and `#/` paths, and relative paths.
- `oxlint` exports two base presets in `configs`, `client` (browser env) and `scripts` (Node env), and add-on presets: `react`, `vitest` (Vitest and Testing Library rules for spec files), `antiSlop` and `bunTest`. List them in `extends`, base first: `extends: [configs.client, react, vitest]`. Before 0.1.17, `client` included React and Vitest.
- `prettier` exports `config` (the same options as oxfmt), one preset per plugin (`sortImports`, `astro`, `svelte`, `tailwind`) and `combine()` to merge them: `combine(config, sortImports, tailwind({ tailwindStylesheet: './src/main.css' }))`. See [its README](./packages/prettier/README.md).
- `tsconfig/bun` (`strictest` + Bun), `tsconfig/vite` (`strictest` + Vite/React) and `tsconfig/client` (`vite` with ambient `types` cleared, so a package only picks up the `@types/*` it asks for).

The Oxlint presets don't enable anti-slop. `antiSlop` from the oxlint entry is an opt-in set with the plugin and all 18 rules as errors; `unicorn/prefer-reflect-apply` is off. See [UPSTREAM.md](./packages/oxc/src/anti-slop/UPSTREAM.md) for its source and update policy.

```ts
import { antiSlop, configs } from '@configg/bases/oxlint'

export default defineConfig({
	extends: [configs.client, antiSlop],
})
```

The plugin ships as TypeScript, so run oxlint under Bun (`bunx --bun oxlint`): Node refuses to strip types from files in `node_modules`.

`bunTest` from the oxlint entry is an opt-in preset for `bun:test` specs: a `bun:test` plugin whose five rules see `describe`, `it` and the hooks when they're imported from `bun:test`, which oxlint's built-in `jest`/`vitest` rules don't. Add it with `extends: [bunTest]`; it has no file glob and checks any file that imports from `bun:test`. See [its docs](./packages/oxc/docs/bun-test/README.md).

Every preset goes in `extends`, base first: `extends: [configs.client, antiSlop, bunTest]`. The base presets keep their environment through `extends`. See [Composing presets](./packages/oxc/README.md#composing-presets).

`eslint-plugin-testing-library` is only needed for the `vitest` add-on in the oxlint preset.

## Development

The repo uses its own packages through the workspace, so there is nothing to build. Formatting, linting, type-checking and git hooks run through [Vite+](https://viteplus.dev) (`vp`), configured in `vite.config.ts`. `vp` needs Node.js (22.22.1+ or 24.11+) on `PATH` next to Bun, including when the pre-commit hook runs.

```sh
bun install        # also installs the git hooks (.vite-hooks)
bun run check      # vp check (fmt + lint + type-check), then the lockfile check
```

## License

[MIT](./LICENSE)
