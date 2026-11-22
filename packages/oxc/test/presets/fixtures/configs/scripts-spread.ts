import { defineConfig } from 'oxlint'

import { configs } from '../../../../src/lint.ts'

// Type-aware linting needs tsgolint and a tsconfig. The test compares env and rules, so it is off in every config.
export default defineConfig({ ...configs.scripts, options: { typeAware: false, typeCheck: false } })
