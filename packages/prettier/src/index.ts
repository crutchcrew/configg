import type { Config } from 'prettier'

/** A config for `combine()`. Call it with overrides to get a preset with them merged in. */
export interface Preset {
	(overrides: Config): Preset
	readonly config: Config
}

function isList(value: unknown): value is readonly unknown[] {
	return Array.isArray(value)
}

/* Arrays concatenate, so `plugins` and `overrides` accumulate; any other value is replaced. */
function merge(target: Config, source: Config): Config {
	const merged: Config = { ...target }

	for (const [key, value] of Object.entries(source)) {
		const current = merged[key]

		merged[key] = value

		if (isList(current) && isList(value)) {
			merged[key] = [...current, ...value]
		}
	}

	return merged
}

function preset(config: Config): Preset {
	return Object.assign((overrides: Config) => preset(merge(config, overrides)), { config })
}

/** Merges presets in order. Pass `tailwind` last: it wraps the parsers of the plugins before it. */
export function combine(...presets: Preset[]): Config {
	return presets.reduce<Config>((merged, { config }) => merge(merged, config), {})
}

export const config = preset({
	arrowParens: 'always',
	bracketSameLine: false,
	bracketSpacing: true,
	embeddedLanguageFormatting: 'auto',
	endOfLine: 'lf',
	experimentalOperatorPosition: 'end',
	htmlWhitespaceSensitivity: 'css',
	jsxSingleQuote: false,
	objectWrap: 'preserve',
	printWidth: 100,
	proseWrap: 'preserve',
	quoteProps: 'as-needed',
	semi: false,
	singleAttributePerLine: false,
	singleQuote: true,
	tabWidth: 2,
	trailingComma: 'all',
	useTabs: true,
})

export const sortImports = preset({
	plugins: ['@ianvs/prettier-plugin-sort-imports'],
	importOrder: ['<BUILTIN_MODULES>', '<THIRD_PARTY_MODULES>', '', '^#/(.*)$', '', '^[.]'],
})

export const astro = preset({
	plugins: ['prettier-plugin-astro'],
	overrides: [{ files: '*.astro', options: { parser: 'astro' } }],
})

export const svelte = preset({
	plugins: ['prettier-plugin-svelte'],
	overrides: [{ files: '*.svelte', options: { parser: 'svelte' } }],
})

export const tailwind = preset({
	plugins: ['prettier-plugin-tailwindcss'],
	tailwindAttributes: ['class', 'className'],
	tailwindFunctions: ['cn', 'cx', 'clsx', 'cva', 'cvx', 'createVariants'],
})
