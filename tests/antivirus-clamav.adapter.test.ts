import { describe, expect, spyOn, test } from "bun:test";
import { AntivirusClamavAdapter } from "../src/antivirus-clamav.adapter";
import * as mocks from "./mocks";

const clean = new Uint8Array([1, 2, 3]);
const virus = new Uint8Array([0x45]);
const adapter = new AntivirusClamavAdapter();

describe("AntivirusClamavAdapter", () => {
  test("clean - true", async () => {
    const bunSpawn = spyOn(Bun, "spawn").mockImplementation((): any => ({
      stdin: { write: () => {}, end: () => {} },
      exitCode: 0,
    }));

    expect(await adapter.scanBytes(clean)).toEqual({ clean: true });
    expect(bunSpawn).toHaveBeenCalledWith({
      cmd: ["clamscan", "--infected", "--no-summary", "--stdout", "-"],
      stderr: "pipe",
      stdin: "pipe",
      stdout: "pipe",
    });
  });

  test("clean - false", async () => {
    spyOn(Bun, "spawn").mockImplementation((): any => ({
      stdin: { write: () => {}, end: () => {} },
      stdout: mocks.stringToStream("stream: Eicar-Test-Signature FOUND\n"),
      exitCode: 1,
    }));

    expect(await adapter.scanBytes(virus)).toEqual({
      clean: false,
      signature: "Eicar-Test-Signature",
    });
  });

  test("ScanFailed", async () => {
    spyOn(Bun, "spawn").mockImplementation(() => ({ exitCode: 2 }) as any);

    expect(async () => adapter.scanBytes(virus)).toThrow("antivirus.scan.failed");
  });
});
