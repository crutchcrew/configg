/**
 * Every value inside an oxfmt or oxlint config: they load as JSON, so nothing else appears in one.
 */
type ConfigValue =
	| boolean
	| number
	| string
	| null
	| undefined
	| readonly ConfigValue[]
	| ConfigObject

interface ConfigObject {
	readonly [key: string]: ConfigValue
}

type IsIndexKey<Key> = string extends Key ? true : number extends Key ? true : false

/**
 * Any part of a config, at any depth. Arrays stay whole, since an array in an override replaces the preset's.
 * Catch-all `[k: string]: unknown` signatures are dropped, so a misspelled key is a type error; typed ones such as
 * `rules` stay, so any rule name still works.
 */
export type DeepPartial<Config> = Config extends readonly unknown[]
	? Config
	: Config extends object
		? {
				[
					Key in keyof Config as unknown extends Config[Key]
						? IsIndexKey<Key> extends true
							? never
							: Key
						: Key
				]?: DeepPartial<Config[Key]> | undefined
			}
		: Config

/**
 * A preset: a plain config object, plus a non-enumerable `with()` that returns the preset with overrides deep-merged in.
 * Because `with` isn't enumerable, spreading, `JSON.stringify` and `structuredClone` see only the config's fields.
 */
export type Preset<Fields, Config = Fields> = Fields & {
	/**
	 * Returns this preset with `overrides` deep-merged into it. Plain objects merge key by key, at any depth; arrays and
	 * every other value replace the preset's; a key set to `undefined` keeps the preset's value. The preset is unchanged.
	 */
	readonly with: (overrides: DeepPartial<Config>) => Preset<Config>
}

/** Only plain objects merge: arrays, `null` and primitives aren't `Object` instances, or have another prototype. */
function isConfigObject(value: ConfigValue): value is ConfigObject {
	return value instanceof Object && Object.getPrototypeOf(value) === Object.prototype
}

function mergeObjects(base: ConfigObject, overrides: ConfigObject): ConfigObject {
	const merged = { ...base }

	for (const [key, value] of Object.entries(overrides)) {
		// An override set to `undefined` keeps the preset's value, so the check has to name `undefined`
		// oxlint-disable-next-line eslint/no-undefined
		if (value === undefined) {
			continue
		}

		const current = merged[key]

		if (isConfigObject(current) && isConfigObject(value)) {
			merged[key] = mergeObjects(current, value)
			continue
		}

		merged[key] = value
	}

	return merged
}

/**
 * The public signature is generic; the implementation works on JSON-shaped values, which every oxfmt and oxlint config
 * is. TypeScript checks an overload against its implementation loosely, so this is the one place the types are trusted:
 * merging a `DeepPartial<Config>` into a `Config` keeps the base's keys and takes each override's value as typed, so the
 * result is a `Config`.
 */
function merge<Config>(base: Config, overrides: DeepPartial<Config>): Config
function merge(base: ConfigObject, overrides: ConfigObject): ConfigObject {
	return mergeObjects(base, overrides)
}

function withPreset<Fields extends Config, Config>(fields: Fields): Preset<Fields, Config> {
	const preset = {
		...fields,
		with(overrides: DeepPartial<Config>): Preset<Config> {
			return withPreset<Config, Config>(merge<Config>(preset, overrides))
		},
	}

	// Spread, JSON and structuredClone copy only enumerable keys, so they see the config's fields alone
	Object.defineProperty(preset, 'with', { enumerable: false })

	return preset
}

/**
 * Returns a function that turns a config into a {@link Preset} for `Config`, the tool's config type.
 * `const` keeps literal types, so `configs.client.rules` lists each rule's own setting.
 */
export function definePresets<Config>() {
	return <const Fields extends Config>(fields: Fields): Preset<Fields, Config> =>
		withPreset<Fields, Config>(fields)
}
