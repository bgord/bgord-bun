import { describe, expect, test } from "bun:test";
import { HashContentNoopAdapter } from "../src/hash-content-noop.adapter";
import * as mocks from "./mocks";

describe("HashContentNoopAdapter", () => {
  test("happy path", async () => {
    const result = await new HashContentNoopAdapter().hash("hello");

    expect(result.matches(mocks.hash)).toEqual(true);
  });
});
