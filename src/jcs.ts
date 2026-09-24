// JSON Canonicalization Scheme, RFC 8785.
//
// ECMAScript already defines the two hard parts the RFC relies on: JSON.stringify's string
// escaping (RFC 8785 §3.2.2.2) and Number.prototype.toString's shortest round-trip form
// (§3.2.2.3). What remains is recursive key sorting by UTF-16 code units (§3.2.3), which is
// what Array.prototype.sort does by default on strings.

export class CanonicalizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CanonicalizationError";
  }
}

export function canonicalize(value: unknown): string {
  if (value === null) return "null";
  switch (typeof value) {
    case "boolean":
      return value ? "true" : "false";
    case "number":
      if (!Number.isFinite(value)) throw new CanonicalizationError(`cannot canonicalize ${value}`);
      return JSON.stringify(value); // -0 serializes as "0", as RFC 8785 requires
    case "string":
      if (/\p{Surrogate}/u.test(value.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, ""))) {
        throw new CanonicalizationError("string contains a lone surrogate");
      }
      return JSON.stringify(value);
    case "object": {
      if (Array.isArray(value)) return `[${value.map(canonicalize).join(",")}]`;
      const obj = value as Record<string, unknown>;
      const proto = Object.getPrototypeOf(obj);
      if (proto !== Object.prototype && proto !== null) {
        throw new CanonicalizationError("only plain objects can be canonicalized");
      }
      const keys = Object.keys(obj)
        .filter((k) => obj[k] !== undefined)
        .sort();
      return `{${keys.map((k) => `${canonicalize(k)}:${canonicalize(obj[k])}`).join(",")}}`;
    }
    default:
      throw new CanonicalizationError(`cannot canonicalize a ${typeof value}`);
  }
}

export function canonicalBytes(value: unknown): Uint8Array<ArrayBuffer> {
  return new TextEncoder().encode(canonicalize(value)) as Uint8Array<ArrayBuffer>;
}
