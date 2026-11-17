// cspell:ignore Clamav clamscan Eicar
import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { AntivirusClamavAdapter } from "../src/antivirus-clamav.adapter";
import * as mocks from "./mocks";

const adapter = new AntivirusClamavAdapter({ timeout: tools.Duration.Seconds(30) });

describe("AntivirusClamavAdapter", () => {
  test("scan - clean - true", async () => {
    // @ts-expect-error Partial access
    using bunSpawn = spyOn(Bun, "spawn").mockImplementation(() => ({ exitCode: 0 }));

    expect(await adapter.scan(mocks.cleanFile)).toEqual({ clean: true });
    expect(bunSpawn).toHaveBeenCalledWith({
      cmd: ["clamscan", "--infected", "--no-summary", "--stdout", "-"],
      stdin: mocks.cleanFile,
      stdout: "pipe",
      stderr: "pipe",
      timeout: 30000,
      killSignal: "SIGKILL",
    });
  });

  test("scan - clean - false", async () => {
    using _ = spyOn(Bun, "spawn").mockImplementation(() => ({
      // @ts-expect-error Partial access
      stdout: mocks.stringToStream("stream: Eicar-Test-Signature FOUND\n"),
      exitCode: 1,
    }));

    expect(await adapter.scan(mocks.virusFile)).toEqual({
      clean: false,
      signature: "Eicar-Test-Signature",
    });
  });

  test("scan - failure - killed", async () => {
    // @ts-expect-error Partial access
    using _ = spyOn(Bun, "spawn").mockImplementation(() => ({ exitCode: null }));

    expect(async () => adapter.scan(mocks.virusFile)).toThrow("antivirus.scan.failed");
  });

  test("scan - failure - exit code", async () => {
    using _ = spyOn(Bun, "spawn").mockImplementation(() => ({
      exitCode: 2,
      // @ts-expect-error Partial access
      stderr: mocks.stringToStream("can't open database"),
    }));

    expect(async () => adapter.scan(mocks.virusFile)).toThrow(
      expect.objectContaining({ message: "antivirus.scan.failed", cause: "can't open database" }),
    );
  });
});
