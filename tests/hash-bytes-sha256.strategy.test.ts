import { describe, expect, test } from "bun:test";
import { Hash } from "../src/hash.vo";
import { HashBytesSha256Strategy } from "../src/hash-bytes-sha256.strategy";
import * as mocks from "./mocks";

describe("HashBytesSha256Strategy", () => {
  test("happy path", async () => {
    const hash = Hash.fromString("2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824");

    const result = await new HashBytesSha256Strategy().hash(mocks.rawHello);

    expect(result.matches(hash)).toEqual(true);
  });

  test("happy path - binary", async () => {
    const hash = Hash.fromString("be611a063fe2322ed4671804fd2e68027756b32e14ec8d64f2e790344eb93261");

    const result = await new HashBytesSha256Strategy().hash(mocks.rawBinary);

    expect(result.matches(hash)).toEqual(true);
  });
});
