# @configg/tsconfig

[![npm version](https://img.shields.io/npm/v/@configg/tsconfig)](https://www.npmjs.com/package/@configg/tsconfig)
[![license](https://img.shields.io/npm/l/@configg/tsconfig)](./LICENSE)

Strictest [`@tsconfig/bases`](https://github.com/tsconfig/bases) presets.

```sh
bun add -d @configg/tsconfig typescript
```

```jsonc
// tsconfig.json
{ "extends": "@configg/tsconfig/client" }
```

| Preset                     | Extends                                                    | For                                       |
| -------------------------- | ---------------------------------------------------------- | ----------------------------------------- |
| `@configg/tsconfig/bun`    | `@tsconfig/bases/strictest` + `@tsconfig/bases/bun`        | Server and tooling code run by Bun        |
| `@configg/tsconfig/vite`   | `@tsconfig/bases/strictest` + `@tsconfig/bases/vite-react` | Client code built by Vite                 |
| `@configg/tsconfig/client` | `@configg/tsconfig/vite`, with `types: []`                 | Client packages that opt in to `@types/*` |
