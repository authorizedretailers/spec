import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { validateFile, validateVerifyRequest, validateVerifyResponse, type ValidationResult } from "../src";

const root = join(import.meta.dirname, "..", "fixtures");
interface Entry { path: string; kind: "file" | "verify-request" | "verify-response"; valid: boolean; expect?: string; note?: string }
const manifest: Entry[] = JSON.parse(readFileSync(join(root, "manifest.json"), "utf8"));

const validators: Record<Entry["kind"], (x: unknown) => ValidationResult<unknown>> = {
  file: validateFile,
  "verify-request": validateVerifyRequest,
  "verify-response": validateVerifyResponse,
};

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : [relative(root, p)];
  });
}

describe("fixtures", () => {
  it("manifest lists every fixture file and nothing else", () => {
    const onDisk = walk(root).filter((p) => p !== "manifest.json").sort();
    expect(manifest.map((e) => e.path).sort()).toEqual(onDisk);
  });

  for (const entry of manifest) {
    it(`${entry.path}${entry.note ? ` (${entry.note})` : ""}`, () => {
      const doc = JSON.parse(readFileSync(join(root, entry.path), "utf8"));
      const result = validators[entry.kind](doc);
      if (entry.valid) {
        expect(result.errors).toEqual([]);
        expect(result.valid).toBe(true);
      } else {
        expect(result.valid).toBe(false);
        expect(result.errors.map((e) => e.code)).toContain(entry.expect);
      }
    });
  }
});
