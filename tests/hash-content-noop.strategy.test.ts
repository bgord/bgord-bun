import { describe, expect, test } from "bun:test";
import { HashContentNoopStrategy } from "../src/hash-content-noop.strategy";
import * as mocks from "./mocks";

describe("HashContentNoopStrategy", () => {
  test("happy path", async () => {
    const result = await new HashContentNoopStrategy().hash("hello");

    expect(result.matches(mocks.hash)).toEqual(true);
  });
});
