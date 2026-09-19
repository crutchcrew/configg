/**
 * Lockstep versioning: the root package.json is the source of truth and every
 * package in `packages/*` carries the same version.
 *
 *   bun scripts/versions.ts set <version>     bump the root and every package
 *   bun scripts/versions.ts check [<version>] fail unless everything matches
 */
import { workspaces, writeManifest } from './manifest.ts'

async function set(version: string): Promise<void> {
	const all = await workspaces()
	for (const { manifest, path } of all) {
		manifest.version = version
		await writeManifest(path, manifest)
	}
	console.log(`Set version ${version} on ${all.length} manifests`)
}

async function check(expected?: string): Promise<boolean> {
	const all = await workspaces()
	const version = expected ?? all[0]?.manifest.version
	const mismatched = all.filter(({ manifest }) => manifest.version !== version)

	for (const { manifest } of mismatched) {
		console.error(`::error::${manifest.name} is at ${manifest.version}, expected ${version}`)
	}
	if (mismatched.length === 0) {
		console.log(`All manifests are at ${version}`)
	}
	return mismatched.length === 0
}

const [command, arg] = process.argv.slice(2)
const version = arg?.replace(/^v/u, '')

if (command === 'set' && version !== undefined) {
	await set(version)
} else if (command === 'check') {
	process.exitCode = (await check(version)) ? 0 : 1
} else {
	console.error('Usage: bun scripts/versions.ts set <version> | check [<version>]')
	process.exitCode = 1
}
