import { describe, expect, spyOn, test } from "bun:test";
import bun from "bun";
import * as tools from "@bgord/tools";
import { DiskSpaceCheckerShellAdapter } from "../src/disk-space-checker-shell.adapter";

describe("DiskSpaceCheckerShellAdapter", () => {
  const adapter = new DiskSpaceCheckerShellAdapter();
  const root = "/";
  const size = tools.Size.fromMB(100);

  const output = {
    header: "Filesystem    1024-blocks    Used    Available    Capacity    Mounted on",
    data: `/dev/disk1s5s1    999999    0    ${size.tokB()}    50%    ${root}`,
  };

  test("happy path", async () => {
    using bunShell = spyOn(bun, "$").mockImplementation(() => ({
      // @ts-expect-error Partial access
      text: () => [output.header, output.data].join("\n"),
    }));

    const result = await adapter.get(root);

    expect(result.toBytes()).toEqual(size.toBytes());
    expect(bunShell).toHaveBeenCalledWith(["df -kP ", ""], root);
  });

  test("trim - handles leading newlines", async () => {
    using _ = spyOn(bun, "$").mockImplementation(() => ({
      // @ts-expect-error Partial access
      text: () => `\n${output.header}\n${output.data}`,
    }));

    const result = await adapter.get(root);

    expect(result.toBytes()).toEqual(size.toBytes());
  });

  test("optional chaining - handles missing data line", async () => {
    // @ts-expect-error Partial access
    using _ = spyOn(bun, "$").mockImplementation(() => ({ text: () => output.header }));

    expect(adapter.get(root)).rejects.toThrow("size.bytes.invalid");
  });
});
