import { describe, expect, test } from "bun:test";
import * as mocks from "./mocks";

const invariant = new mocks.SampleInvariant();

describe("Invariant", () => {
  test("passes", async () => {
    expect(invariant.passes({ threshold: 15 })).toEqual(false);
    expect(invariant.passes({ threshold: 10 })).toEqual(true);
    expect(mocks.SampleInvariant).toBeDefined();
  });

  test("ensure - success", async () => {
    expect(async () => invariant.enforce({ threshold: 5 })).not.toThrow();
  });

  test("ensure - failure", async () => {
    expect(async () => invariant.enforce({ threshold: 15 })).toThrow(invariant.error);
  });

  test("ensure - failure carries the message", async () => {
    expect(async () => invariant.enforce({ threshold: 15 })).toThrow("SampleInvariant failed");
  });

  test("throw - carries the message", async () => {
    expect(() => invariant.throw()).toThrow("SampleInvariant failed");
  });
});
