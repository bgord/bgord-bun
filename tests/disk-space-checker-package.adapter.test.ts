import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as checkDiskSpace from "check-disk-space";
import { DiskSpaceCheckerPackageAdapter } from "../src/disk-space-checker-package.adapter";

const DiskSpaceCheckerPackage = new DiskSpaceCheckerPackageAdapter();

const size = tools.Size.fromMB(100);

describe("DiskSpaceCheckerPackageAdapter", () => {
  test("happy path", async () => {
    spyOn(checkDiskSpace, "default").mockResolvedValue({ diskPath: "", size: 0, free: size.toBytes() });

    const result = await DiskSpaceCheckerPackage.get("/");
    expect(result.toBytes()).toEqual(size.toBytes());
  });
});
