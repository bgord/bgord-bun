import { describe, expect, spyOn, test } from "bun:test";
import bun from "bun";
import * as tools from "@bgord/tools";
import { DiskSpaceCheckerBunAdapter } from "../src/disk-space-checker-bun.adapter";

const root = "/";
const size = tools.Size.fromMB(100);
const response = [
  "Filesystem 1024-blocks Used Available Capacity Mounted on",
  `/dev/disk1s5s1 999999 0 ${size.tokB()} 50% ${root}`,
].join("\n");

const DiskSpaceChecker = new DiskSpaceCheckerBunAdapter();

describe("DiskSpaceCheckerBunAdapter", () => {
  test("happy path", async () => {
    // @ts-expect-error
    spyOn(bun, "$").mockImplementation(() => ({ text: () => response }));

    const result = await DiskSpaceChecker.get(root);

    expect(result.toBytes()).toEqual(size.toBytes());
  });
});
