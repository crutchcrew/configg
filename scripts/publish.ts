/**
 * Publish the root package and every package in `packages/*` to npm.
 * Versions that already exist on the registry are skipped, so a failed run can
 * be re-run safely.
 *
 *   bun scripts/publish.ts              publish with provenance
 *   bun scripts/publish.ts --dry-run    pack and validate, publish nothing
 */
import { workspaces } from './manifest.ts'

const dryRun = process.argv.includes('--dry-run')

async function isPublished(name: string, version: string): Promise<boolean> {
	const proc = Bun.spawn(['npm', 'view', `${name}@${version}`, 'version'], {
		stderr: 'ignore',
		stdout: 'pipe',
	})
	const output = await new Response(proc.stdout).text()
	return (await proc.exited) === 0 && output.trim() === version
}

const failed: string[] = []

for (const { cwd, manifest } of await workspaces()) {
	const label = `${manifest.name}@${manifest.version}`

	if (!dryRun && (await isPublished(manifest.name, manifest.version))) {
		console.log(`- ${label} is already on npm, skipping`)
		continue
	}

	console.log(`- ${dryRun ? 'Packing' : 'Publishing'} ${label}`)
	const args = ['publish', '--access', 'public', ...(dryRun ? ['--dry-run'] : ['--provenance'])]
	const proc = Bun.spawn(['npm', ...args], { cwd, stderr: 'inherit', stdout: 'inherit' })

	if ((await proc.exited) !== 0) {
		failed.push(label)
	}
}

if (failed.length > 0) {
	console.error(`::error::Failed to publish: ${failed.join(', ')}`)
	process.exitCode = 1
}
