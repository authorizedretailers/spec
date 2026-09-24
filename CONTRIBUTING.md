# Contributing

Thanks for helping shape the standard. Brands, retailers, marketplaces and agent developers all have cases this draft may not handle yet, and those are the most useful contributions.

## Ways to contribute

- **A problem with the spec:** open an issue describing the real situation. Say who is affected (brand, retailer, distributor, agent) and what the spec currently says or leaves out. Concrete examples beat abstract proposals.
- **A change to the spec:** for anything beyond wording, open an issue first so the change can be discussed before anyone writes it up. Then send a pull request that updates `spec/spec-v0.1.md`, adds a line to its changelog (§14), and, if behavior changes, updates the schemas, fixtures and tests to match.
- **A bug in the schemas or code:** a pull request with a failing test is ideal.
- **Open questions:** §13 of the spec lists questions for v0.2. Issues discussing them are welcome.

## Ground rules for spec changes

- Every new MUST needs a test, or a clear statement of why it can't be tested here. See `docs/MUST-coverage.md`.
- Keep the scope tight. The spec asserts authorization only; proposals about authenticity, pricing or legal status are out of scope.
- Prefer changes that a brand could publish by hand and an agent could check with a few lines of code.
- Breaking changes are allowed before v1.0, but say so in the PR and the changelog.

## Development

```bash
npm install
npm test          # schemas, fixtures, validator, canonicalization, signing
npm run test:dist # build, then exercise the published entry points in plain Node
npm run typecheck
node scripts/build-fixtures.mjs   # regenerate fixtures after changing a schema
```

Fixtures are generated. Edit `scripts/build-fixtures.mjs`, not the JSON files.

## Contributor License Agreement

Before your first pull request can be merged, sign the [Contributor License Agreement](CLA.md). To sign, add yourself to [`cla/signatures.md`](cla/signatures.md) in a commit you author, in that pull request or an earlier one:

```
- @your-github-username, Your Full Name
```

If you contribute for your employer, add `, for Company Legal Name` and make sure the company agrees (see section 7 of the CLA). A check on every pull request confirms that each commit author has signed. It only accepts a signature added in a commit by that same person. Commits must be authored with an email linked to your GitHub account (your GitHub no-reply address works).

You keep the copyright in your contributions. The CLA gives the project owner a license to use them, including under licenses other than the ones this repository uses today, plus a patent license.

## Conduct

Be respectful and assume good faith. Maintainers may moderate or close discussions that aren't.
