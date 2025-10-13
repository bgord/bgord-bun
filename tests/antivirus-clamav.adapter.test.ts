import { describe, expect, spyOn, test } from "bun:test";
import { AntivirusPortError } from "../src/antivirus.port";
import { AntivirusClamavAdapter } from "../src/antivirus-clamav.adapter";

function streamFromString(s: string): ReadableStream<Uint8Array> {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(s));
      controller.close();
    },
  });
}

describe("AntivirusClamavAdapter.scanBytes", () => {
  test("returns clean: true when exitCode = 0", async () => {
    const spawnSpy = spyOn(Bun, "spawn").mockImplementation((): any => ({
      stdin: { write: async (_: Uint8Array) => {}, end: async () => {} },
      stdout: streamFromString(""),
      stderr: streamFromString(""),
      exitCode: 0,
      exited: Promise.resolve(0),
    }));

    const adapter = new AntivirusClamavAdapter();
    const result = await adapter.scanBytes(new Uint8Array([1, 2, 3]));
    expect(result).toEqual({ clean: true });

    const call = spawnSpy.mock.calls[0]?.[0];
    // @ts-expect-error
    expect(call.cmd).toEqual(["clamscan", "--infected", "--no-summary", "--stdout", "-"]);
    // @ts-expect-error
    expect(call.stdin).toEqual("pipe");
  });

  test("parses signature from stdout when exitCode = 1", async () => {
    spyOn(Bun, "spawn").mockImplementation((): any => ({
      stdin: { write: async () => {}, end: async () => {} },
      stdout: streamFromString("stream: Eicar-Test-Signature FOUND\n"),
      stderr: streamFromString(""),
      exitCode: 1,
      exited: Promise.resolve(1),
    }));

    const adapter = new AntivirusClamavAdapter();
    const result = await adapter.scanBytes(new Uint8Array([0x45]));
    expect(result).toEqual({ clean: false, signature: "Eicar-Test-Signature" });
  });

  test("parses signature from stderr when exitCode = 1", async () => {
    spyOn(Bun, "spawn").mockImplementation((): any => ({
      stdin: { write: async () => {}, end: async () => {} },
      stdout: streamFromString(""),
      stderr: streamFromString("stream: Bad-Sig-123 FOUND\n"),
      exitCode: 1,
      exited: Promise.resolve(1),
    }));

    const adapter = new AntivirusClamavAdapter();
    const result = await adapter.scanBytes(new Uint8Array([0]));
    expect(result).toEqual({ clean: false, signature: "Bad-Sig-123" });
  });

  test("ScanFailed", async () => {
    spyOn(Bun, "spawn").mockImplementation((): any => ({
      stdin: null,
      stdout: streamFromString(""),
      stderr: streamFromString(""),
      exitCode: 2,
      exited: Promise.resolve(2),
    }));

    expect(() => new AntivirusClamavAdapter().scanBytes(new Uint8Array([1]))).toThrow(
      AntivirusPortError.ScanFailed,
    );
  });

  test("VirusDetected", async () => {
    spyOn(Bun, "spawn").mockImplementation((): any => ({
      stdin: { write: async () => {}, end: async () => {} },
      stdout: streamFromString(""),
      stderr: streamFromString("ERROR: database not found"),
      exitCode: 2,
      exited: Promise.resolve(2),
    }));

    expect(() => new AntivirusClamavAdapter().scanBytes(new Uint8Array([1, 2, 3]))).toThrow(
      AntivirusPortError.VirusDetected,
    );
  });
});
