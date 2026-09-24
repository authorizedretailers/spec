const TIMESTAMP_RE = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(\.\d{1,9})?Z$/;

/**
 * Parses a UTC RFC 3339 timestamp to epoch ms, or returns null if it is malformed or names an
 * impossible date (Date.parse silently rolls "2026-02-30" over into March).
 */
export function parseTimestamp(value: string): number | null {
  const m = TIMESTAMP_RE.exec(value);
  if (!m) return null;
  const [year, month, day, hour, minute, second] = m.slice(1, 7).map(Number) as [
    number, number, number, number, number, number,
  ];
  const ms = Date.UTC(year, month - 1, day, hour, minute, second);
  const d = new Date(ms);
  if (
    d.getUTCFullYear() !== year ||
    d.getUTCMonth() !== month - 1 ||
    d.getUTCDate() !== day ||
    d.getUTCHours() !== hour ||
    d.getUTCMinutes() !== minute ||
    d.getUTCSeconds() !== second
  ) {
    return null;
  }
  const frac = m[7] ? Number(m[7].slice(1, 4).padEnd(3, "0")) : 0;
  return ms + frac;
}

export function formatTimestamp(ms: number): string {
  return new Date(ms).toISOString().replace(/\.000Z$/, "Z");
}
