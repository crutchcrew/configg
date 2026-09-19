# configg ⚙️

[![CI](https://github.com/crutchcrew/configg/actions/workflows/ci.yml/badge.svg)](https://github.com/crutchcrew/configg/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@configg/bases)](https://www.npmjs.com/package/@configg/bases)
[![provenance](https://img.shields.io/badge/provenance-verified-brightgreen)](https://www.npmjs.com/package/@configg/bases)
[![license](https://img.shields.io/github/license/crutchcrew/configg)](./LICENSE)

Shared configuration presets for code tooling. One package per tool, or all of them in a single install.

The presets ship as TypeScript and JSON source. There is no build step, so use them from a runtime or tool that can load `.ts` files from `node_modules` (Bun, or the tool's own loader).

## Packages

| Package                                    | Version                                                                                                   | What it configures                                          |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| [`@configg/oxc`](./packages/oxc)           | [![npm](https://img.shields.io/npm/v/@configg/oxc)](https://www.npmjs.com/package/@configg/oxc)           | `oxfmt` (`/fmt`) and `oxlint` (`/lint`) presets             |
| [`@configg/tsconfig`](./packages/tsconfig) | [![npm](https://img.shields.io/npm/v/@configg/tsconfig)](https://www.npmjs.com/package/@configg/tsconfig) | Strictest `tsconfig` presets for Bun and Vite               |
| `@configg/bases` (this repo's root)        | [![npm](https://img.shields.io/npm/v/@configg/bases)](https://www.npmjs.com/package/@configg/bases)       | All of the above under one name, straight from `packages/*` |

Install only what you use, or install `@configg/bases` and import everything from it:

| `@configg/bases/…`           | Same as                               |
| ---------------------------- | ------------------------------------- |
| `oxfmt`                      | `@configg/oxc/fmt`                    |
| `oxlint`                     | `@configg/oxc/lint`                   |
| `tsconfig/{bun,client,vite}` | `@configg/tsconfig/{bun,client,vite}` |

## Usage

Tools are `peerDependencies`: you install `oxfmt`, `oxlint` and `typescript` yourself and pin the versions you want. The packages only supply the presets.

```sh
bun add -d @configg/bases oxfmt oxlint oxlint-tsgolint typescript
```

```ts
// oxfmt.config.ts
import { defineConfig } from 'oxfmt'
import { configs } from '@configg/bases/oxfmt'

export default defineConfig(configs.client)
```

```ts
// oxlint.config.ts
import { defineConfig } from 'oxlint'
import { configs } from '@configg/bases/oxlint'

export default defineConfig(configs.client)
```

```jsonc
// tsconfig.json
{ "extends": "@configg/bases/tsconfig/client" }
```

Installing a single package works the same way, for example `@configg/oxc/fmt` and `@configg/oxc/lint`.

### Presets

- `oxfmt` exports `configs`: `client` (Tailwind class sorting, import grouping), `scripts` (shared base for tooling and config files) and `server` (shared base).
- `oxlint` exports `configs`: `client` (browser env, React, and a `**/*.spec.{ts,tsx}` override with Vitest and Testing Library rules) and `scripts` (Node env).
- `tsconfig/bun` (`strictest` + Bun), `tsconfig/vite` (`strictest` + Vite/React) and `tsconfig/client` (`vite` with ambient `types` cleared, so a package only picks up the `@types/*` it asks for).

`eslint-plugin-testing-library` is only needed for `configs.client` in the oxlint preset.

## Development

The repo uses its own packages through the workspace, so there is nothing to build.

```sh
bun install
bun run check      # fmt + lint (with type-check) + lockfile, in parallel
```

## License

[MIT](./LICENSE)
