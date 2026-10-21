/**
 * Splits a server summary like "Right eye 20/20, left eye 20/30" into per-eye values for
 * the two-column layout. Display only: returns null when the summary has another shape.
 */
export function perEye(summary: string): { right: string; left: string } | null {
  const m = summary.match(/right eye\s+([^,]+),\s*left eye\s+(.+)/i);
  return m ? { right: m[1].trim(), left: m[2].trim() } : null;
}

