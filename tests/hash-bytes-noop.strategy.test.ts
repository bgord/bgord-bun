import { describe, expect, test } from "bun:test";
import { HashBytesNoopStrategy } from "../src/hash-bytes-noop.strategy";
import * as mocks from "./mocks";

describe("HashBytesNoopStrategy", () => {
  test("happy path", async () => {
    const result = await new HashBytesNoopStrategy().hash(new ArrayBuffer(0));

    expect(result.matches(mocks.hash)).toEqual(true);
  });
});
