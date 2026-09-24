// Test vectors from RFC 8785.
import { describe, expect, it } from "vitest";
import { canonicalize, CanonicalizationError } from "../src/jcs";

const fromHex = (hex: string) => new DataView(Uint8Array.from(hex.match(/../g)!.map((b) => parseInt(b, 16))).buffer).getFloat64(0);

describe("RFC 8785", () => {
  it("§3.2.2 example: literals, numbers, strings", () => {
    const input = JSON.parse(
      '{"numbers":[333333333.33333329,1E30,4.50,2e-3,0.000000000000000000000000001],' +
        '"string":"\\u20ac$\\u000F\\u000aA\'\\u0042\\u0022\\u005c\\\\\\"\\/","literals":[null,true,false]}',
    );
    expect(canonicalize(input)).toBe(
      '{"literals":[null,true,false],"numbers":[333333333.3333333,1e+30,4.5,0.002,1e-27],' +
        '"string":"€$\\u000f\\nA\'B\\"\\\\\\\\\\"/"}',
    );
  });

  it("§3.2.3 sorts keys by UTF-16 code units", () => {
    const input = JSON.parse('{"\\u20ac":"Euro Sign","\\r":"Carriage Return","\\ufb33":"Hebrew Letter Dalet With Dagesh","1":"One","\\ud83d\\ude00":"Emoji: Grinning Face","\\u0080":"Control","\\u00f6":"Latin Small Letter O With Diaeresis"}');
    expect(canonicalize(input)).toBe(
      '{"\\r":"Carriage Return","1":"One","\u0080":"Control","\u00f6":"Latin Small Letter O With Diaeresis","\u20ac":"Euro Sign","\ud83d\ude00":"Emoji: Grinning Face","\ufb33":"Hebrew Letter Dalet With Dagesh"}',
    );
  });

  it("sorts nested objects and keeps array order", () => {
    expect(canonicalize({ b: [3, { z: 1, a: 2 }], a: { d: null, c: true } })).toBe('{"a":{"c":true,"d":null},"b":[3,{"a":2,"z":1}]}');
  });

  // Appendix B: IEEE 754 bit patterns and their canonical form.
  const numbers: [string, string][] = [
    ["0000000000000000", "0"],
    ["8000000000000000", "0"],
    ["0000000000000001", "5e-324"],
    ["8000000000000001", "-5e-324"],
    ["7fefffffffffffff", "1.7976931348623157e+308"],
    ["ffefffffffffffff", "-1.7976931348623157e+308"],
    ["4340000000000000", "9007199254740992"],
    ["c340000000000000", "-9007199254740992"],
    ["4430000000000000", "295147905179352830000"],
    ["44b52d02c7e14af5", "9.999999999999997e+22"],
    ["44b52d02c7e14af6", "1e+23"],
    ["44b52d02c7e14af7", "1.0000000000000001e+23"],
    ["444b1ae4d6e2ef4e", "999999999999999700000"],
    ["444b1ae4d6e2ef4f", "999999999999999900000"],
    ["444b1ae4d6e2ef50", "1e+21"],
    ["3eb0c6f7a0b5ed8c", "9.999999999999997e-7"],
    ["3eb0c6f7a0b5ed8d", "0.000001"],
    ["41b3de4355555553", "333333333.3333332"],
    ["41b3de4355555554", "333333333.33333325"],
    ["41b3de4355555555", "333333333.3333333"],
    ["41b3de4355555556", "333333333.3333334"],
    ["41b3de4355555557", "333333333.33333343"],
    ["becbf647612f3696", "-0.0000033333333333333333"],
    ["43143ff3c1cb0959", "1424953923781206.2"],
  ];
  for (const [hex, expected] of numbers) {
    it(`Appendix B: ${hex} → ${expected}`, () => {
      expect(canonicalize(fromHex(hex))).toBe(expected);
    });
  }

  it("Appendix B: NaN and Infinity are errors", () => {
    expect(() => canonicalize(fromHex("7fffffffffffffff"))).toThrow(CanonicalizationError);
    expect(() => canonicalize(fromHex("7ff0000000000000"))).toThrow(CanonicalizationError);
  });

  it("rejects lone surrogates and non-JSON values", () => {
    expect(() => canonicalize("\ud800")).toThrow(CanonicalizationError);
    expect(canonicalize("😀")).toBe('"😀"');
    expect(() => canonicalize(new Date(0))).toThrow(CanonicalizationError);
    expect(() => canonicalize(() => 1)).toThrow(CanonicalizationError);
    expect(() => canonicalize(1n)).toThrow(CanonicalizationError);
  });

  it("drops undefined properties like JSON.stringify", () => {
    expect(canonicalize({ a: undefined, b: 1 })).toBe('{"b":1}');
  });
});
