declare module "*/cla-lib.mjs" {
  export function signedLogins(markdown: string): Set<string>;
  export function checkCla(input: { commitAuthors: (string | null)[]; signedOnBase: Set<string>; signedOnHead: Set<string>; newLineAuthors: Map<string, string | null> }): { ok: boolean; problems: string[] };
}
