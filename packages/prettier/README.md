# @configg/prettier

[![npm version](https://img.shields.io/npm/v/@configg/prettier)](https://www.npmjs.com/package/@configg/prettier)
[![license](https://img.shields.io/npm/l/@configg/prettier)](./LICENSE)

[Prettier](https://prettier.io) presets with the same options as the [`oxfmt` presets](../oxc).

```sh
bun add -d @configg/prettier prettier
```

## Presets

`@configg/prettier` exports `configs`, a record of plain config objects without plugins:

- `client`: the shared base plus `htmlWhitespaceSensitivity: 'css'` and double quotes in JSX.
- `scripts`: the shared base, for tooling and config files.
- `server`: the shared base.

```ts
// prettier.config.ts
import { configs } from '@configg/prettier'

export default configs.client
```

## Plugins

Each plugin is a separate export holding its `plugins` entry and the options it reads. Install the
ones you use and compose them yourself. Spread them over a preset, then list `plugins` and `overrides`
explicitly so none of them replaces another's:

| Export        | Plugin                                | Adds                                                                 |
| ------------- | ------------------------------------- | -------------------------------------------------------------------- |
| `sortImports` | `@ianvs/prettier-plugin-sort-imports` | Import groups: `react`, external, `components`, `utils`, relative    |
| `astro`       | `prettier-plugin-astro`               | The `astro` parser for `*.astro`                                     |
| `svelte`      | `prettier-plugin-svelte`              | The `svelte` parser for `*.svelte`                                   |
| `tailwind`    | `prettier-plugin-tailwindcss`         | Class sorting in `class`, `className`, `cx()` and `createVariants()` |

`tailwind` wraps the parsers of the plugins listed before it, so it goes last.

```sh
bun add -d @configg/prettier prettier @ianvs/prettier-plugin-sort-imports prettier-plugin-astro prettier-plugin-svelte prettier-plugin-tailwindcss
```

```ts
// prettier.config.ts
import type { Config } from 'prettier'
import { astro, configs, sortImports, svelte, tailwind } from '@configg/prettier'

export default {
	...configs.client,
	...sortImports,
	...tailwind,
	plugins: [...sortImports.plugins, ...astro.plugins, ...svelte.plugins, ...tailwind.plugins],
	overrides: [...astro.overrides, ...svelte.overrides],
	tailwindStylesheet: './src/main.css',
} satisfies Config
```

Prettier resolves plugin names from your config file, so the plugins come from your own
`node_modules`.

## License

[MIT](./LICENSE)
