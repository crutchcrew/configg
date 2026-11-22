import type { OxfmtConfig } from 'oxfmt'

import { definePresets } from './preset.ts'

export type { DeepPartial, Preset } from './preset.ts'

const preset = definePresets<OxfmtConfig>()

const base = {
	arrowParens: 'always',
	bracketSameLine: false,
	bracketSpacing: true,
	embeddedLanguageFormatting: 'auto',
	endOfLine: 'lf',
	experimentalOperatorPosition: 'end',
	insertFinalNewline: true,
	objectWrap: 'preserve',
	printWidth: 100,
	proseWrap: 'preserve',
	quoteProps: 'as-needed',
	semi: false,
	singleAttributePerLine: false,
	singleQuote: true,
	sortPackageJson: true,
	tabWidth: 2,
	trailingComma: 'all',
	useTabs: true,
} satisfies OxfmtConfig

// Bare `bun` reads as an external package to oxfmt; `bun:*` and `node:*` are already `builtin`
const bunGroup = { elementNamePattern: ['bun'], groupName: 'bun' }

/** Built-ins (with Bun), packages, `#/` and other internal paths, relative paths, styles, then anything left. */
const sortImports = {
	customGroups: [bunGroup],
	groups: [
		['builtin', 'bun'],
		'external',
		['internal', 'subpath'],
		['parent', 'sibling', 'index'],
		'style',
		'unknown',
	],
} satisfies OxfmtConfig['sortImports']

const server = preset({ ...base, sortImports })

/** Each preset is a plain config object; call `.with(overrides)` on one to deep-merge changes into it. */
export const configs = {
	client: preset({
		...base,
		endOfLine: 'lf',
		htmlWhitespaceSensitivity: 'css',
		insertFinalNewline: true,
		jsxSingleQuote: false,
		sortImports: {
			customGroups: [
				{ elementNamePattern: ['react', 'react/**', 'react-*', 'react-*/**'], groupName: 'react' },
				bunGroup,
				{ elementNamePattern: ['**/components/**', '**/components'], groupName: 'components' },
				{ elementNamePattern: ['**/utils/**', '**/utils'], groupName: 'utils' },
			],
			groups: [
				'react',
				['builtin', 'bun'],
				'external',
				['internal', 'subpath'],
				'components',
				'utils',
				['parent', 'sibling', 'index'],
				'style',
				'unknown',
			],
		},
		sortTailwindcss: {
			attributes: ['class', 'className'],
			functions: ['cx', 'createVariants'],
		},
	}),
	scripts: server,
	server,
}
