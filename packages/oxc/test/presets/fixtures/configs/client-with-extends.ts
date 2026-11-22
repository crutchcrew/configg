import { defineConfig } from 'oxlint'

import { configs, react, vitest } from '../../../../src/lint.ts'

// The same config as client-with-spread.ts, written with `.with()`
export default defineConfig({
	extends: [
		configs.client.with({ rules: { 'eslint/eqeqeq': 'off' } }),
		react.with({ rules: { 'react/jsx-key': 'off' } }),
		vitest,
	],
	options: { typeAware: false, typeCheck: false },
})
