import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import { Probability } from "../src/probability";

describe("Probability", () => {
  test("happy path", () => {
    expect(v.safeParse(Probability, 0.42).success).toEqual(true);
  });

  test("happy path - zero", () => {
    expect(v.safeParse(Probability, 0).success).toEqual(true);
  });

  test("happy path - one", () => {
    expect(v.safeParse(Probability, 1).success).toEqual(true);
  });

  test("rejects non-number", () => {
    expect(() => v.parse(Probability, "0.5")).toThrow("probability.type");
  });

  test("rejects NaN", () => {
    expect(() => v.parse(Probability, Number.NaN)).toThrow("probability.type");
  });

  test("rejects below zero", () => {
    expect(() => v.parse(Probability, -0.01)).toThrow("probability.invalid");
  });

  test("rejects above one", () => {
    expect(() => v.parse(Probability, 1.01)).toThrow("probability.invalid");
  });

  test("rejects infinity", () => {
    expect(() => v.parse(Probability, Number.POSITIVE_INFINITY)).toThrow("probability.invalid");
  });
});
