import { describe, expect, it } from "vitest";
import { checkCla, signedLogins } from "../scripts/cla-lib.mjs";

const base = new Set(["maintainer"]);

describe("CLA check", () => {
  it("parses signature lines", () => {
    expect(signedLogins("# CLA\n- @Alice, Alice A\n- @bob-2, Bob, for Acme Inc\nnot - @eve\n")).toEqual(new Set(["alice", "bob-2"]));
  });

  it("passes signed authors and bots", () => {
    expect(checkCla({ commitAuthors: ["maintainer", "dependabot[bot]"], signedOnBase: base, signedOnHead: base, newLineAuthors: new Map() }).ok).toBe(true);
  });

  it("fails an unsigned author, and one whose email isn't a GitHub account", () => {
    const r = checkCla({ commitAuthors: ["newcomer", null], signedOnBase: base, signedOnHead: base, newLineAuthors: new Map() });
    expect(r.ok).toBe(false);
    expect(r.problems).toHaveLength(2);
  });

  it("accepts a newcomer who signs in their own commit", () => {
    const head = new Set([...base, "newcomer"]);
    expect(checkCla({ commitAuthors: ["newcomer"], signedOnBase: base, signedOnHead: head, newLineAuthors: new Map([["newcomer", "newcomer"]]) }).ok).toBe(true);
  });

  it("refuses a signature added by someone else", () => {
    const head = new Set([...base, "victim"]);
    const r = checkCla({ commitAuthors: ["mallory"], signedOnBase: base, signedOnHead: head, newLineAuthors: new Map([["victim", "mallory"]]) });
    expect(r.problems).toContain("The signature for @victim must be added in a commit authored by @victim.");
  });
});
