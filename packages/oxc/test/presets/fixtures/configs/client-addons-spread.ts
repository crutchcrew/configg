import { defineConfig } from 'oxlint'

import { configs, react, vitest } from '../../../../src/lint.ts'

// Type-aware linting needs tsgolint and a tsconfig. The test compares env and rules, so it is off in every config.
export default defineConfig({
	...configs.client,
	extends: [react, vitest],
	options: { typeAware: false, typeCheck: false },
})
