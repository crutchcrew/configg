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

## Peer dependencies

`oxfmt`, `oxlint`, `oxlint-tsgolint` and `eslint-plugin-testing-library` are all optional peers, so you install only the ones the presets you use need.
