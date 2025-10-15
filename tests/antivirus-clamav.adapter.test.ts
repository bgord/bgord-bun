import { describe, expect, spyOn, test } from "bun:test";
import { AntivirusPortError } from "../src/antivirus.port";
import { AntivirusClamavAdapter } from "../src/antivirus-clamav.adapter";
import * as mocks from "./mocks";

describe("AntivirusClamavAdapter.scanBytes", () => {
  test("clean - exit code 0", async () => {
    const spawnSpy = spyOn(Bun, "spawn").mockImplementation((): any => ({
      stdin: { write: async (_: Uint8Array) => {}, end: async () => {} },
      stdout: mocks.stringToStream(""),
      stderr: mocks.stringToStream(""),
      exitCode: 0,
      exited: Promise.resolve(0),
    }));

    expect(await new AntivirusClamavAdapter().scanBytes(new Uint8Array([1, 2, 3]))).toEqual({ clean: true });

    // @ts-expect-error
    expect(spawnSpy.mock.calls[0]?.[0].cmd).toEqual([
      "clamscan",
      "--infected",
      "--no-summary",
      "--stdout",
      "-",
    ]);
  });

  test("not clean - signature found", async () => {
    spyOn(Bun, "spawn").mockImplementation((): any => ({
      stdin: { write: async () => {}, end: async () => {} },
      stdout: mocks.stringToStream("stream: Eicar-Test-Signature FOUND\n"),
      stderr: mocks.stringToStream(""),
      exitCode: 1,
      exited: Promise.resolve(1),
    }));

    expect(await new AntivirusClamavAdapter().scanBytes(new Uint8Array([0x45]))).toEqual({
      clean: false,
      signature: "Eicar-Test-Signature",
    });
  });

  test("ScanFailed", async () => {
    spyOn(Bun, "spawn").mockImplementation((): any => ({
      stdin: null,
      stdout: mocks.stringToStream(""),
      stderr: mocks.stringToStream(""),
      exitCode: 2,
      exited: Promise.resolve(2),
    }));

    expect(() => new AntivirusClamavAdapter().scanBytes(new Uint8Array([1]))).toThrow(
      AntivirusPortError.ScanFailed,
    );
  });
});
