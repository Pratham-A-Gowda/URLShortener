// filepath: /Users/pratham/Documents/Code/URL Shortener/backend/__tests__/nanoid.test.js
const { nanoid } = require("../utils/nanoid");

describe("nanoid", () => {
  test("generates default length 8", () => {
    const id = nanoid();
    expect(id).toHaveLength(8);
  });

  test("generates only lowercase letters and digits", () => {
    const id = nanoid(20);
    expect(/^[a-z0-9]{20}$/.test(id)).toBe(true);
  });

  test("different calls likely produce different ids", () => {
    const a = nanoid();
    const b = nanoid();
    expect(a).not.toEqual(b);
  });

  test("respects custom sizes", () => {
    expect(nanoid(1)).toHaveLength(1);
    expect(nanoid(16)).toHaveLength(16);
    expect(nanoid(32)).toHaveLength(32);
  });

  test("size 0 returns empty string", () => {
    expect(nanoid(0)).toBe("");
  });

  test("negative size returns empty string", () => {
    expect(nanoid(-5)).toBe("");
    expect(nanoid(-0.1)).toBe("");
  });

  test("non-integer size rounds up", () => {
    expect(nanoid(1.01)).toHaveLength(2);
    expect(nanoid(10.7)).toHaveLength(11);
  });

  test("string size is coerced to a number", () => {
    expect(nanoid("10")).toHaveLength(10);
  });

  test("NaN or non-numeric size yields empty string", () => {
    expect(nanoid(NaN)).toBe("");
    // non-numeric string coerces to NaN in comparison, resulting in empty string
    expect(nanoid("not-a-number")).toBe("");
  });

  test("many calls produce unique values (low collision probability)", () => {
    const count = 3000;
    const set = new Set();
    for (let i = 0; i < count; i++) {
      set.add(nanoid());
    }
    expect(set.size).toBe(count);
  });

  test("sampled ids contain only allowed characters", () => {
    const invalid = /[^a-z0-9]/;
    for (let i = 0; i < 500; i++) {
      const id = nanoid(24);
      expect(invalid.test(id)).toBe(false);
    }
  });

  test("handles large sizes", () => {
    const size = 10000;
    const id = nanoid(size);
    expect(id).toHaveLength(size);
    expect(/^[a-z0-9]+$/.test(id)).toBe(true);
  });
});
