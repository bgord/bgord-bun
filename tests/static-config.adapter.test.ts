import { describe, expect, test } from "bun:test";
import { StaticConfigAdapter } from "../src/static-config.adapter";

describe("StaticConfigAdapter", () => {
  test("happy path", async () => {
    const result = new StaticConfigAdapter<{ threshold: number }>({ threshold: 42 }).get();

    expect(Object.isFrozen(result)).toEqual(true);
    expect(result).toEqual({ threshold: 42 });
  });
});
