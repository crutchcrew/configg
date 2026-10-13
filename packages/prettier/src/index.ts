import type { Config } from 'prettier'

const base = {
	arrowParens: 'always',
	bracketSameLine: false,
	bracketSpacing: true,
	embeddedLanguageFormatting: 'auto',
	endOfLine: 'lf',
	experimentalOperatorPosition: 'end',
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
} satisfies Config

export const configs = {
	client: {
		...base,
		htmlWhitespaceSensitivity: 'css',
		jsxSingleQuote: false,
	},
	scripts: base,
	server: base,
} satisfies Record<string, Config>

export const sortImports = {
	plugins: ['@ianvs/prettier-plugin-sort-imports'],
	importOrder: [
		'^react$',
		'^react/(.*)$',
		'^react-(.*)$',
		'',
		'<BUILTIN_MODULES>',
		'<THIRD_PARTY_MODULES>',
		'',
		'(^|[/#])components(/|$)',
		'',
		'(^|[/#])utils(/|$)',
		'',
		'^[.]',
	],
} satisfies Config

export const astro = {
	plugins: ['prettier-plugin-astro'],
	overrides: [{ files: '*.astro', options: { parser: 'astro' } }],
} satisfies Config

export const svelte = {
	plugins: ['prettier-plugin-svelte'],
	overrides: [{ files: '*.svelte', options: { parser: 'svelte' } }],
} satisfies Config

/* It wraps the parsers of the plugins listed before it, so it goes last in `plugins`. */
export const tailwind = {
	plugins: ['prettier-plugin-tailwindcss'],
	tailwindAttributes: ['class', 'className'],
	tailwindFunctions: ['cx', 'createVariants'],
} satisfies Config
