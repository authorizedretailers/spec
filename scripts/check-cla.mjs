// CI entry point: fails the pull request unless every commit author has signed the CLA.
// Needs GITHUB_TOKEN, GITHUB_REPOSITORY, PR_NUMBER, BASE_SHA, HEAD_SHA; runs in a full checkout.
import { execFileSync } from "node:child_process";
import { checkCla, signedLogins } from "./cla-lib.mjs";

const { GITHUB_TOKEN, GITHUB_REPOSITORY, PR_NUMBER, BASE_SHA, HEAD_SHA } = process.env;
const FILE = "cla/signatures.md";

async function gh(path) {
  const res = await fetch(`https://api.github.com${path}`, { headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, Accept: "application/vnd.github+json" } });
  if (!res.ok) throw new Error(`GitHub API ${res.status} for ${path}`);
  return res.json();
}

const git = (...args) => execFileSync("git", args, { encoding: "utf8" });
const fileAt = (sha) => {
  try {
    return git("show", `${sha}:${FILE}`);
  } catch {
    return "";
  }
};

const commits = [];
for (let page = 1; ; page++) {
  const batch = await gh(`/repos/${GITHUB_REPOSITORY}/pulls/${PR_NUMBER}/commits?per_page=100&page=${page}`);
  commits.push(...batch);
  if (batch.length < 100) break;
}
const authorOf = new Map(commits.map((c) => [c.sha, c.author?.login ?? null]));

const signedOnBase = signedLogins(fileAt(BASE_SHA));
const signedOnHead = signedLogins(fileAt(HEAD_SHA));
const newLineAuthors = new Map();
if ([...signedOnHead].some((l) => !signedOnBase.has(l))) {
  // Which commit added each line (porcelain blame at the PR head).
  const blame = git("blame", "--line-porcelain", HEAD_SHA, "--", FILE);
  let sha = null;
  for (const line of blame.split("\n")) {
    if (/^[0-9a-f]{40} /.test(line)) sha = line.slice(0, 40);
    else if (line.startsWith("\t")) {
      for (const login of signedLogins(line.slice(1))) {
        if (!signedOnBase.has(login)) newLineAuthors.set(login, authorOf.get(sha) ?? null);
      }
    }
  }
}

const { ok, problems } = checkCla({ commitAuthors: commits.map((c) => c.author?.login ?? null), signedOnBase, signedOnHead, newLineAuthors });
if (ok) {
  console.log("CLA: all commit authors have signed.");
} else {
  for (const p of problems) console.log(`::error::${p}`);
  process.exit(1);
}
