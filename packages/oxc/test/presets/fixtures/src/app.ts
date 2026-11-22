export const w = window.location.href
export const p = typeof process === 'undefined' ? 0 : 1
var legacy = 1
export { legacy }
export function maybe(x: number | null) { return x == null ? 0 : x }
