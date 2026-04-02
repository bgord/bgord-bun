import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as v from "valibot";
import { DiskSpaceCheckerNoopAdapter } from "../src/disk-space-checker-noop.adapter";

const root = v.parse(tools.DirectoryPathAbsoluteSchema, "/");
const size = tools.Size.fromMB(100);

const DiskSpaceChecker = new DiskSpaceCheckerNoopAdapter(size);

describe("DiskSpaceCheckerNoopAdapter", () => {
  test("happy path", async () => {
    const result = await DiskSpaceChecker.get(root);

    expect(result.toBytes()).toEqual(size.toBytes());
  });
});
