import { describe, expect, test } from "bun:test";
import { SecurityCountermeasureName } from "../src/security-countermeasure-name.vo";
import { SecurityCountermeasureNoopStrategy } from "../src/security-countermeasure-noop.strategy";

const countermeasure = new SecurityCountermeasureNoopStrategy();

describe("SecurityCountermeasureNoopStrategy", () => {
  test("happy path", async () => {
    const result = await countermeasure.execute();

    expect(result).toEqual({ kind: "allow" });
  });

  test("name", () => {
    expect(countermeasure.name).toEqual(SecurityCountermeasureName.parse("noop"));
  });
});
