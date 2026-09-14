/** One random element from an array, or undefined for an empty one. */
export function pickRandom<T>(items: readonly T[]): T | undefined {
  if (items.length === 0) return undefined;
  return items[Math.floor(Math.random() * items.length)];
}

/** A random page number from 1 to max (inclusive). */
export function randomPage(max: number): number {
  return 1 + Math.floor(Math.random() * Math.max(1, max));
}
