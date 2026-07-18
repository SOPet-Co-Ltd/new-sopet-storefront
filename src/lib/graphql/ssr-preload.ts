export type SsrPreloadSuccess<T> = { ok: true; data: T };
export type SsrPreloadFailure = { ok: false };
export type SsrPreloadResult<T> = SsrPreloadSuccess<T> | SsrPreloadFailure;

/**
 * Runs SSR GraphQL work and converts transport/GraphQL failures into a soft
 * degrade signal. Callers should pass `data` as `initial*` props and must not
 * wrap the tree in `PreloadQuery` (Apollo's PreloadQuery rethrows network
 * failures during RSC render and produces a production Server Components digest).
 */
export async function runSsrPreloadQueries<T>(
  label: string,
  run: () => Promise<T>,
): Promise<SsrPreloadResult<T>> {
  try {
    const data = await run();
    return { ok: true, data };
  } catch (error) {
    console.error('[ssr-preload]', label, error);
    return { ok: false };
  }
}
