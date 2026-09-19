import type { OxfmtConfig } from 'oxfmt'

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

export const configs = {
	client: {
		...base,
		endOfLine: 'lf',
		htmlWhitespaceSensitivity: 'css',
		insertFinalNewline: true,
		jsxSingleQuote: false,
		sortImports: {
			customGroups: [
				{ elementNamePattern: ['react', 'react/**', 'react-*', 'react-*/**'], groupName: 'react' },
				{ elementNamePattern: ['**/components/**', '**/components'], groupName: 'components' },
				{ elementNamePattern: ['**/utils/**', '**/utils'], groupName: 'utils' },
			],
			groups: ['react', 'external', 'components', 'utils', ['parent', 'sibling', 'index']],
		},
		sortTailwindcss: {
			attributes: ['class', 'className'],
			functions: ['cx', 'createVariants'],
		},
	},
	scripts: base,
	server: base,
} satisfies Record<string, OxfmtConfig>
