import { defineConfig } from 'oxlint'

import { configs, react, vitest } from '../../../../src/lint.ts'

// The same config as client-with-extends.ts, written with spreads
export default defineConfig({
	extends: [
		{ ...configs.client, rules: { ...configs.client.rules, 'eslint/eqeqeq': 'off' } },
		{ ...react, rules: { ...react.rules, 'react/jsx-key': 'off' } },
		vitest,
	],
	options: { typeAware: false, typeCheck: false },
})
