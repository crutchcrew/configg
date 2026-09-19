import { readdirSync } from 'node:fs'
import { join } from 'node:path'

export const ROOT = join(import.meta.dir, '..')

export interface Manifest {
	name: string
	version: string
}

export interface Workspace {
	cwd: string
	manifest: Manifest
	path: string
}

export async function readManifest(path: string): Promise<Manifest> {
	// oxlint-disable-next-line typescript/no-unsafe-type-assertion -- our own package.json files
	return (await Bun.file(path).json()) as Manifest
}

export async function writeManifest(path: string, manifest: Manifest): Promise<void> {
	await Bun.write(path, `${JSON.stringify(manifest, null, '\t')}\n`)
}

/** The root package (`@configg/bases`) followed by every package in `packages/*`. */
export async function workspaces(): Promise<Workspace[]> {
	const cwds = [
		ROOT,
		...readdirSync(join(ROOT, 'packages')).map((dir) => join(ROOT, 'packages', dir)),
	]
	const all = await Promise.all(
		cwds.map(async (cwd) => {
			const path = join(cwd, 'package.json')
			return { cwd, manifest: await readManifest(path), path }
		}),
	)
	return all
}
