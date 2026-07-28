import { describe, expect, test } from "bun:test";
import { StaticConfigAdapter } from "../src/static-config.adapter";

const value = 5;

const adapter = new StaticConfigAdapter<number>(value);

describe("StaticConfigAdapter", () => {
  test("happy path", async () => {
    expect(adapter.get()).toEqual(value);
  });
});
