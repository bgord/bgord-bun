import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Checksum } from "../src/checksum.service";
import { Hash } from "../src/hash.vo";
import type { HashFileResult } from "../src/hash-file.port";
import * as mocks from "./mocks";

const base: HashFileResult = {
  etag: mocks.hash,
  size: tools.Size.fromBytes(10),
  lastModified: tools.Timestamp.fromNumber(1000),
  mime: tools.Mimes.text.mime,
};

describe("Checksum", () => {
  test("true", () => {
    expect(Checksum.compare(base, base)).toEqual(true);
  });

  test("false - etag", () => {
    expect(Checksum.compare(base, { ...base, etag: Hash.fromString("1".repeat(64)) })).toEqual(false);
  });

  test("false - size", () => {
    expect(Checksum.compare(base, { ...base, size: tools.Size.fromBytes(9999) })).toEqual(false);
  });

  test("false - lastModified", () => {
    expect(Checksum.compare(base, { ...base, lastModified: tools.Timestamp.fromNumber(2000) })).toEqual(
      false,
    );
  });
});
