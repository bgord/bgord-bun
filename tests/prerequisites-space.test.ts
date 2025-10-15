import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as checkDiskSpace from "check-disk-space";
import { PrerequisiteSpace } from "../src/prerequisites/space";
import * as prereqs from "../src/prerequisites.service";
import * as mocks from "./mocks";

const minimum = tools.Size.fromMB(50);

const config = { diskPath: "", size: 0 };

describe("prerequisites - space", () => {
  test("success", async () => {
    spyOn(checkDiskSpace, "default").mockResolvedValue({ ...config, free: tools.Size.fromMB(100).toBytes() });

    expect(await new PrerequisiteSpace({ label: "space", minimum }).verify()).toEqual(
      prereqs.Verification.success(),
    );
  });

  test("failure - not enough space", async () => {
    const free = tools.Size.fromMB(10);
    spyOn(checkDiskSpace, "default").mockResolvedValue({ ...config, free: free.toBytes() });

    // @ts-expect-error
    expect((await new PrerequisiteSpace({ label: "space", minimum }).verify()).error.message).toMatch(
      `Free disk space: ${free.format(tools.Size.unit.MB)}`,
    );
  });

  test("failure - error", async () => {
    spyOn(checkDiskSpace, "default").mockRejectedValue(new Error(mocks.IntentialError));

    // @ts-expect-error
    expect((await new PrerequisiteSpace({ label: "space", minimum }).verify()).error.message).toMatch(
      mocks.IntentialError,
    );
  });

  test("undetermined", async () => {
    expect(await new PrerequisiteSpace({ label: "space", minimum, enabled: false }).verify()).toEqual(
      prereqs.Verification.undetermined(),
    );
  });
});
