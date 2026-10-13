# @configg/prettier

[![npm version](https://img.shields.io/npm/v/@configg/prettier)](https://www.npmjs.com/package/@configg/prettier)
[![license](https://img.shields.io/npm/l/@configg/prettier)](./LICENSE)

[Prettier](https://prettier.io) presets with the same options as the [`oxfmt` presets](../oxc), and a
`combine()` helper to compose them.

```sh
bun add -d @configg/prettier prettier
```

```ts
// prettier.config.ts
import { combine, config } from '@configg/prettier'

export default combine(config)
```

## Presets

Every export except `combine` is a preset. Pass it to `combine()` as is, or call it with overrides to
get a new preset with them merged in.

| Preset        | Plugin                                | Adds                                                                                                     |
| ------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `config`      | —                                     | Formatting options: tabs, single quotes, no semicolons, trailing commas, 100 columns                     |
| `sortImports` | `@ianvs/prettier-plugin-sort-imports` | Import groups: built-in and external, `#/*` subpath imports, relative                                    |
| `astro`       | `prettier-plugin-astro`               | The `astro` parser for `*.astro`                                                                         |
| `svelte`      | `prettier-plugin-svelte`              | The `svelte` parser for `*.svelte`                                                                       |
| `tailwind`    | `prettier-plugin-tailwindcss`         | Class sorting in `class`, `className`, `cn()`, `cx()`, `clsx()`, `cva()`, `cvx()` and `createVariants()` |

Install the plugins of the presets you use:

```sh
bun add -d @configg/prettier prettier @ianvs/prettier-plugin-sort-imports prettier-plugin-astro prettier-plugin-svelte prettier-plugin-tailwindcss
```

```ts
// prettier.config.ts
import { astro, combine, config, sortImports, svelte, tailwind } from '@configg/prettier'

export default combine(
	config,
	sortImports,
	astro,
	svelte,
	tailwind({ tailwindStylesheet: './src/main.css' }),
)
```

`combine()` merges presets in order, and so does calling a preset with overrides. Arrays
concatenate, so `plugins` and `overrides` accumulate (`{ plugins: ['a'] }` and `{ plugins: ['b'] }`
give `{ plugins: ['a', 'b'] }`); any other value is replaced by the later one. Pass `tailwind` last:
it wraps the parsers of the plugins listed before it.

Prettier resolves plugin names from your config file, so the plugins come from your own
`node_modules`.

## License

[MIT](./LICENSE)
