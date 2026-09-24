// Runs against the built package in plain Node, the way an agent developer would use it.
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { canonicalize, signDetached, signingPayload, validateFile, verifyDocument } from "../dist/index.js";
import { verifyDocument as verifyFromJws } from "../dist/jws.js";

const fixture = JSON.parse(readFileSync(new URL("../fixtures/file/valid/full-unsigned-handwritten.json", import.meta.url), "utf8"));
assert.equal(validateFile(fixture).valid, true, "validator works from dist");
assert.equal(canonicalize({ b: 1, a: [2, { d: 3, c: 4 }] }), '{"a":[2,{"c":4,"d":3}],"b":1}');

const { privateKey, publicKey } = await crypto.subtle.generateKey({ name: "Ed25519" }, true, ["sign", "verify"]);
const { x } = await crypto.subtle.exportKey("jwk", publicKey);
const jwks = { keys: [{ kty: "OKP", crv: "Ed25519", x, kid: "ar-20260101-0001" }] };
const signed = { ...fixture, signature: { kid: "ar-20260101-0001", jws: await signDetached(privateKey, "ar-20260101-0001", signingPayload(fixture)) } };
assert.deepEqual(await verifyDocument(signed, jwks, { now: Date.parse("2026-10-01T00:00:00Z") }), { valid: true, kid: "ar-20260101-0001" });
assert.equal((await verifyFromJws(signed, jwks, { now: Date.parse("2026-10-01T00:00:00Z") })).valid, true, "jws entry point works alone");
console.log("dist smoke test passed");
