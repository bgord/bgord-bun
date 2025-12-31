import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Checksum } from "../src/checksum.service";
import { Hash } from "../src/hash.vo";
import type { HashFileResult } from "../src/hash-file.port";
import * as mocks from "./mocks";

const a: HashFileResult = {
  etag: mocks.hash,
  size: tools.Size.fromBytes(10),
  lastModified: tools.Timestamp.fromNumber(1000),
  mime: tools.MIMES.text,
};
const b: HashFileResult = {
  etag: Hash.fromString("1111111111111111111111111111111111111111111111111111111111111111"),
  size: tools.Size.fromBytes(10),
  lastModified: tools.Timestamp.fromNumber(1000),
  mime: tools.MIMES.text,
};

describe("Checksum service", () => {
  test("etag", async () => {
    expect(Checksum.compare(a, a)).toEqual(true);
    expect(Checksum.compare(a, b)).toEqual(false);
  });

  test("complex", async () => {
    expect(Checksum.compare(a, a)).toEqual(true);
    expect(Checksum.compare(a, b)).toEqual(false);
  });
});
