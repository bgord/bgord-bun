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
  mime: tools.MIMES.text,
};

describe("Checksum service", () => {
  test("returns true when files are identical", () => {
    expect(Checksum.compare(base, base)).toEqual(true);
  });

  test("returns false when etag differs", () => {
    const otherEtag = { ...base, etag: Hash.fromString("1".repeat(64)) };

    expect(Checksum.compare(base, otherEtag)).toEqual(false);
  });

  test("returns false when size differs", () => {
    const otherEtag = { ...base, size: tools.Size.fromBytes(9999) };

    expect(Checksum.compare(base, otherEtag)).toEqual(false);
  });

  test("returns false when lastModified differs", () => {
    const otherEtag = { ...base, lastModified: tools.Timestamp.fromNumber(2000) };

    expect(Checksum.compare(base, otherEtag)).toEqual(false);
  });
});
