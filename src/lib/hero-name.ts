/**
 * The hero wordmark on a preview: the business's name set like ORDOVA, its first O drawn as the Ordova
 * ring (the 3D dive goes through it). A name without an O gets the ring in front, like a mark.
 */
export function heroName(name: string) {
  const s = name.trim();
  const i = s.search(/o/i);
  // Big type on one line: longer names shrink to fit `width` (vw). Syne ExtraBold caps run ~1.15em a letter
  // (measured), a space ~0.27em, the ring ~0.86em (1.16em in front, with its gap); ORDOVA itself is ~6.6em.
  const em = nameEm(s) - (i < 0 ? -1.16 : 0.29);
  const fit = (max: number, width: number) => `min(${max}vw, ${(width / Math.max(6.6, em)).toFixed(2)}vw)`;
  return i < 0 ? { before: "", after: s, ringFirst: true, hasO: false, fit } : { before: s.slice(0, i), after: s.slice(i + 1), ringFirst: false, hasO: true, fit };
}

/** Width of a name in Syne ExtraBold caps, in em (measured: ~1.15em a letter, ~0.27em a space). */
export const nameEm = (name: string) => [...name.trim()].reduce((w, c) => w + (c === " " ? 0.27 : /[.,'’]/.test(c) ? 0.4 : 1.15), 0);
