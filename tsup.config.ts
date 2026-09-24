import { defineConfig } from "tsup";

// ESM only; JSON Schemas are bundled into dist so no import attributes are needed at runtime.
// jws and jcs are separate entry points so a signer or verifier can import them without the validator.
export default defineConfig({
  entry: { index: "src/index.ts", jws: "src/jws.ts", jcs: "src/jcs.ts" },
  format: ["esm"],
  target: "es2022",
  platform: "neutral",
  dts: true,
  splitting: true,
  clean: true,
  sourcemap: true,
});
