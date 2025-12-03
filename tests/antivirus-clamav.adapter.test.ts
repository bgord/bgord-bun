import { describe, expect, spyOn, test } from "bun:test";
import { AntivirusPortError } from "../src/antivirus.port";
import { AntivirusClamavAdapter } from "../src/antivirus-clamav.adapter";
import * as mocks from "./mocks";

describe("AntivirusClamavAdapter", () => {
  test("clean - exit code 0", async () => {
    const bunSpawn = spyOn(Bun, "spawn").mockImplementation((): any => ({
      stdin: { write: async (_: Uint8Array) => {}, end: async () => {} },
      exitCode: 0,
    }));

    expect(await new AntivirusClamavAdapter().scanBytes(new Uint8Array([1, 2, 3]))).toEqual({ clean: true });

    // @ts-expect-error
    expect(bunSpawn.mock.calls[0]?.[0].cmd).toEqual([
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
      exitCode: 1,
    }));

    expect(await new AntivirusClamavAdapter().scanBytes(new Uint8Array([0x45]))).toEqual({
      clean: false,
      signature: "Eicar-Test-Signature",
    });
  });

  test("ScanFailed", async () => {
    spyOn(Bun, "spawn").mockImplementation(() => ({ exitCode: 2 }) as any);

    expect(() => new AntivirusClamavAdapter().scanBytes(new Uint8Array([1]))).toThrow(
      AntivirusPortError.ScanFailed,
    );
  });
});
