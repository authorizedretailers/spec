# Authorized Retailers

An open standard for brands to publish which retailers they've authorized, and for AI shopping agents to verify a seller before they recommend or buy.

> **Status: draft v0.1.** Open for discussion with brands, retailers and agent developers. Breaking changes are expected before v1.0.

The standard answers one question: has this brand authorized this seller, on this channel, in this territory, for this product scope, as of this date? It doesn't say whether an item is authentic, and it says nothing about pricing or legal status.

- **Read the spec:** [`spec/spec-v0.1.md`](spec/spec-v0.1.md), also at [authorizedretailers.ai/spec](https://authorizedretailers.ai/spec)
- **Check a brand:** [authorizedretailers.ai](https://authorizedretailers.ai)

## What's in this repository

| Path | What |
| --- | --- |
| `spec/` | The specification (CC BY 4.0) |
| `schemas/` | JSON Schemas (draft 2020-12) for the three file forms and the verify request and response |
| `src/` | TypeScript types, a validator, identifier matching, RFC 8785 canonicalization, and detached EdDSA JWS signing and verification |
| `fixtures/` | Valid and invalid example files, with a `manifest.json` saying what each should produce |
| `docs/MUST-coverage.md` | Every MUST in the spec, and which are tested here |

## Use it

```bash
npm install @authorizedretailers/spec
```

It works in Node 20+, Cloudflare Workers, Deno and browsers, since it only uses Web Crypto.

### Verify a signed answer (agents)

```ts
import { verifyDocument } from "@authorizedretailers/spec";

const answer = await fetch("https://authorizedretailers.ai/v0/verify", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    brand_domain: "examplebrand.com",
    channel: { type: "amazon", marketplace: "US", seller_id: "A1B2C3D4E5F6G7" },
    territory: "US",
  }),
}).then((r) => r.json());

const jwks = await fetch("https://authorizedretailers.ai/.well-known/jwks.json").then((r) => r.json());
const check = await verifyDocument(answer, jwks);
// { valid: true, kid } or { valid: false, reason }. The verifier rejects keys no longer in
// the key set and answers past their valid_until. On "unknown_kid", refetch the key set once.
```

### Validate a brand's file

```ts
import { validateFile, validAuthorizations } from "@authorizedretailers/spec";

const result = validateFile(await fetch("https://examplebrand.com/.well-known/authorized-retailers.json").then((r) => r.json()));
if (result.valid && result.value.form === "full") {
  const current = validAuthorizations(result.value); // an expired file yields none (§5)
}
```

### Match sellers the way the spec requires

Match on the identifier the agent sees, never on a retailer name (§6). `channelKey()` normalizes identifiers (case, whitespace, `www.`, the `UK`/`GB` alias) so two readers always agree.

## Implementing the standard

- Registries, indexes and verifiers can use the schemas and `fixtures/manifest.json` as a conformance suite.
- `docs/MUST-coverage.md` lists every MUST in the spec and the test covering the parts this package implements.
- authorizedretailers.ai runs a registry on this standard. Anyone may run another.

## Contributing

Issues and pull requests are welcome, especially from brands, retailers and agent developers with real cases the spec doesn't cover yet. See [CONTRIBUTING.md](CONTRIBUTING.md). Contributions need a signed [Contributor License Agreement](CLA.md).

## License

- The specification and other documents in `spec/` and `docs/`: [CC BY 4.0](LICENSE-docs)
- Code, JSON Schemas and fixtures: [Apache-2.0](LICENSE)
