import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as checkDiskSpace from "check-disk-space";
import { PrerequisiteSpace } from "../src/prerequisites/space";
import * as prereqs from "../src/prerequisites.service";

const minimum = tools.Size.fromMB(50);

describe("prerequisites - space", () => {
  test("passes when enough space is available", async () => {
    spyOn(checkDiskSpace, "default").mockResolvedValue({
      diskPath: "",
      size: 0,
      free: tools.Size.fromMB(100).toBytes(),
    });

    const prerequisite = new PrerequisiteSpace({ label: "Disk", minimum });

    expect(await prerequisite.verify()).toEqual(prereqs.Verification.success());
  });

  test("fails when not enough space is available", async () => {
    const free = tools.Size.fromMB(10);
    spyOn(checkDiskSpace, "default").mockResolvedValue({ diskPath: "", size: 0, free: free.toBytes() });

    const prerequisite = new PrerequisiteSpace({ label: "Disk", minimum });
    // @ts-expect-error
    expect((await prerequisite.verify()).error.message).toMatch(
      `Free disk space: ${free.format(tools.SizeUnit.MB)}`,
    );
  });

  test("fails on error", async () => {
    spyOn(checkDiskSpace, "default").mockRejectedValue(new Error("Check disk error"));

    const prerequisite = new PrerequisiteSpace({ label: "Disk", minimum });
    // @ts-expect-error
    expect((await prerequisite.verify()).error.message).toMatch(/Check disk error/);
  });

  test("returns undetermined if disabled", async () => {
    const prerequisite = new PrerequisiteSpace({ label: "Disk", minimum, enabled: false });

    expect(await prerequisite.verify()).toEqual(prereqs.Verification.undetermined());
  });
});
