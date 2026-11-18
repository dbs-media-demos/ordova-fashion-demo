/**
 * Runs `cb` when the browser is idle (requestIdleCallback), or after `fallbackMs` where there is no
 * such thing. The returned cancel always matches the one used: a requestIdleCallback id handed to
 * clearTimeout can cancel an unrelated timer that happens to share the number.
 */
export function onIdle(cb: () => void, { timeout, fallbackMs = 200 }: { timeout?: number; fallbackMs?: number } = {}): () => void {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(() => cb(), timeout ? { timeout } : undefined);
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(cb, fallbackMs);
  return () => window.clearTimeout(id);
}
