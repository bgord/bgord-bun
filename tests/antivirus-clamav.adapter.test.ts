import { describe, expect, spyOn, test } from "bun:test";
import { AntivirusClamavAdapter } from "../src/antivirus-clamav.adapter";
import * as mocks from "./mocks";

const adapter = new AntivirusClamavAdapter();

describe("AntivirusClamavAdapter", () => {
  test("scan - clean - true", async () => {
    using bunSpawn = spyOn(Bun, "spawn").mockImplementation(() => ({
      // @ts-expect-error Partial access
      stdin: { write: () => {}, end: () => {} },
      exitCode: 0,
    }));

    expect(await adapter.scan(mocks.cleanFile)).toEqual({ clean: true });
    expect(bunSpawn).toHaveBeenCalledWith({
      cmd: ["clamscan", "--infected", "--no-summary", "--stdout", "-"],
      stderr: "pipe",
      stdin: "pipe",
      stdout: "pipe",
    });
  });

  test("scan - clean - false", async () => {
    using _ = spyOn(Bun, "spawn").mockImplementation(() => ({
      // @ts-expect-error Partial access
      stdin: { write: () => {}, end: () => {} },
      // @ts-expect-error Partial access
      stdout: mocks.stringToStream("stream: Eicar-Test-Signature FOUND\n"),
      exitCode: 1,
    }));

    expect(await adapter.scan(mocks.virusFile)).toEqual({
      clean: false,
      signature: "Eicar-Test-Signature",
    });
  });

  test("scan - failure - missing stdin", async () => {
    // @ts-expect-error Partial access
    using _ = spyOn(Bun, "spawn").mockImplementation(() => ({ exitCode: 0 }));

    expect(async () => adapter.scan(mocks.virusFile)).toThrow("antivirus.scan.failed");
  });

  test("scan - failure - exit code", async () => {
    using _ = spyOn(Bun, "spawn").mockImplementation(() => ({
      exitCode: 2,
      // @ts-expect-error Partial access
      stdin: { write: () => {}, end: () => {} },
    }));

    expect(async () => adapter.scan(mocks.virusFile)).toThrow("antivirus.scan.failed");
  });
});
