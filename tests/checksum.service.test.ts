import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Checksum, ChecksumStrategy } from "../src/checksum.service";
import type { FileHashResult } from "../src/file-hash.port";
import { Hash } from "../src/hash.vo";

const a: FileHashResult = {
  etag: Hash.fromString("0000000000000000000000000000000000000000000000000000000000000000"),
  size: tools.Size.fromBytes(10),
  lastModified: tools.Timestamp.fromNumber(1000),
  mime: tools.MIMES.text,
};
const b: FileHashResult = {
  etag: Hash.fromString("1111111111111111111111111111111111111111111111111111111111111111"),
  size: tools.Size.fromBytes(10),
  lastModified: tools.Timestamp.fromNumber(1000),
  mime: tools.MIMES.text,
};

describe("Checksum service", () => {
  test("etag", async () => {
    expect(Checksum.compare(a, a, ChecksumStrategy.etag)).toEqual(true);
    expect(Checksum.compare(a, b, ChecksumStrategy.etag)).toEqual(false);
  });

  test("complex", async () => {
    expect(Checksum.compare(a, a, ChecksumStrategy.complex)).toEqual(true);
    expect(Checksum.compare(a, b, ChecksumStrategy.complex)).toEqual(false);
  });
});
