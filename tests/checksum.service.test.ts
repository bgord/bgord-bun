import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Checksum, ChecksumStrategy } from "../src/checksum.service";
import type { FileHashResult } from "../src/file-hash.port";

const a: FileHashResult = {
  etag: "noop",
  size: tools.Size.fromBytes(10),
  lastModified: tools.Timestamp.fromNumber(1000),
  mime: new tools.Mime("text/plain"),
};

const b: FileHashResult = {
  etag: "poon",
  size: tools.Size.fromBytes(10),
  lastModified: tools.Timestamp.fromNumber(1000),
  mime: new tools.Mime("text/plain"),
};

describe("Checksum", () => {
  test("etag", async () => {
    expect(Checksum.compare(a, a, ChecksumStrategy.etag)).toEqual(true);
    expect(Checksum.compare(a, b, ChecksumStrategy.etag)).toEqual(false);
  });

  test("complex", async () => {
    expect(Checksum.compare(a, a, ChecksumStrategy.complex)).toEqual(true);
    expect(Checksum.compare(a, b, ChecksumStrategy.complex)).toEqual(false);
  });
});
