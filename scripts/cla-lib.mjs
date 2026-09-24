// Pure CLA-check logic, used by scripts/check-cla.mjs in CI and by test/cla.test.ts.

/** GitHub logins signed in a signatures.md body (lines like "- @login, Name"). */
export function signedLogins(markdown) {
  const out = new Set();
  for (const line of markdown.split("\n")) {
    const m = /^\s*-\s*@([A-Za-z0-9](?:[A-Za-z0-9-]{0,38}))\b/.exec(line);
    if (m) out.add(m[1].toLowerCase());
  }
  return out;
}

const isBot = (login) => /\[bot\]$/i.test(login);

/**
 * @param {object} input
 * @param {(string|null)[]} input.commitAuthors  GitHub logins of the PR's commit authors (null = email not linked to an account)
 * @param {Set<string>} input.signedOnBase       logins already signed on the base branch
 * @param {Set<string>} input.signedOnHead       logins signed at the PR head
 * @param {Map<string, string|null>} input.newLineAuthors  for each login newly signed in this PR, the login of the commit that added its line
 * @returns {{ ok: boolean, problems: string[] }}
 */
export function checkCla({ commitAuthors, signedOnBase, signedOnHead, newLineAuthors }) {
  const problems = [];
  if (commitAuthors.some((a) => a === null)) {
    problems.push("Some commits are authored by an email that isn't linked to a GitHub account. Use an email on your GitHub account (or your GitHub no-reply address) and re-push.");
  }
  // Only a person can sign for themselves.
  for (const [login, addedBy] of newLineAuthors) {
    if (addedBy?.toLowerCase() !== login) problems.push(`The signature for @${login} must be added in a commit authored by @${login}.`);
  }
  for (const login of new Set(commitAuthors.filter(Boolean).map((a) => a.toLowerCase()))) {
    if (isBot(login) || signedOnBase.has(login)) continue;
    if (!signedOnHead.has(login)) problems.push(`@${login} hasn't signed the CLA. Add a line to cla/signatures.md in this pull request (see CONTRIBUTING.md).`);
  }
  return { ok: problems.length === 0, problems };
}
