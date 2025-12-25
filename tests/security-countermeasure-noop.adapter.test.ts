import { describe, expect, test } from "bun:test";
import { SecurityCountermeasureName } from "../src/security-countermeasure-name.vo";
import { SecurityCountermeasureNoopAdapter } from "../src/security-countermeasure-noop.adapter";

const countermeasure = new SecurityCountermeasureNoopAdapter();

describe("SecurityCountermeasureNoopAdapter", () => {
  test("happy path", async () => {
    const result = await countermeasure.execute();

    expect(result).toEqual({ kind: "allow" });
  });

  test("name", () => {
    expect(countermeasure.name).toEqual(SecurityCountermeasureName.parse("noop"));
  });
});
