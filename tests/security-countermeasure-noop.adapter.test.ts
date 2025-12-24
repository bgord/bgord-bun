import { describe, expect, test } from "bun:test";
import { SecurityCountermeasureNoopAdapter } from "../src/security-countermeasure-noop.adapter";

describe("SecurityCountermeasureNoopAdapter", () => {
  test("happy path", async () => {
    const countermeasure = new SecurityCountermeasureNoopAdapter();

    const result = await countermeasure.execute();

    expect(result).toEqual({ kind: "allow" });
  });
});
