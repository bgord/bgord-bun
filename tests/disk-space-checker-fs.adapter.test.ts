/* cSpell:disable */
import { describe, expect, spyOn, test } from "bun:test";
import fs from "node:fs/promises";
import * as tools from "@bgord/tools";
import * as v from "valibot";
import { DiskSpaceCheckerFsAdapter } from "../src/disk-space-checker-fs.adapter";

const root = v.parse(tools.DirectoryPathAbsoluteSchema, "/");
const adapter = new DiskSpaceCheckerFsAdapter();

describe("DiskSpaceCheckerFsAdapter", () => {
  test("happy path", async () => {
    using fsStatfs = spyOn(fs, "statfs").mockResolvedValue({
      bavail: 100,
      bsize: 1024,
      blocks: 0,
      bfree: 0,
      type: 0,
      files: 0,
      frsize: 0,
      ffree: 0,
    });

    const result = await adapter.get(root);

    expect(result.toBytes()).toEqual(v.parse(tools.SizeBytes, 100 * 1024));
    expect(fsStatfs).toHaveBeenCalledWith(root);
  });
});
