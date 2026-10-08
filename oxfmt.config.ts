import { defineConfig } from 'oxfmt'
import { configs } from '@configg/oxc/fmt'

export default defineConfig({
	...configs.scripts,
	ignorePatterns: ['packages/oxc/src/anti-slop/**'],
})
