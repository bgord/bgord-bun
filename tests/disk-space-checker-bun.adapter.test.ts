import { describe, expect, spyOn, test } from "bun:test";
import bun from "bun";
import * as tools from "@bgord/tools";
import { DiskSpaceCheckerBunAdapter } from "../src/disk-space-checker-bun.adapter";

const DiskSpaceChecker = new DiskSpaceCheckerBunAdapter();
const root = "/";

const size = tools.Size.fromMB(100);

const response = [
  "Filesystem 1024-blocks Used Available Capacity Mounted on",
  `/dev/disk1s5s1 999999 0 ${size.tokB()} 50% ${root}`,
].join("\n");

describe("DiskSpaceCheckerBunAdapter", () => {
  test("happy path", async () => {
    // @ts-expect-error
    spyOn(bun, "$").mockImplementation(() => ({ text: () => response }));

    expect((await DiskSpaceChecker.get(root)).toBytes()).toEqual(size.toBytes());
  });
});
