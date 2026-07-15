/** Count user-perceived characters (Thai grapheme-safe for min-length gates). */
export function queryGraphemeLength(query: string): number {
  return [...query.trim()].length;
}
