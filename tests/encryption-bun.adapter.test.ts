import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { CryptoKeyProviderNoopAdapter } from "../src/crypto-key-provider-noop.adapter";
import { EncryptionBunAdapter, EncryptionBunAdapterError } from "../src/encryption-bun.adapter";

const provider = new CryptoKeyProviderNoopAdapter();
const adapter = new EncryptionBunAdapter(provider);

const INPUT = tools.FilePathAbsolute.fromString("/tmp/plain.txt");
const ENC = tools.FilePathAbsolute.fromString("/tmp/plain.enc");
const DEC = tools.FilePathAbsolute.fromString("/tmp/plain.dec");

const TEXT = "hello world";
const encoder = new TextEncoder();
const decoder = new TextDecoder();

describe("EncryptionBunAdapter", () => {
  test("encrypt → decrypt", async () => {
    let enc: Uint8Array | null = null;
    spyOn(Bun, "file").mockReturnValue({ arrayBuffer: async () => encoder.encode(TEXT).buffer } as any);
    spyOn(Bun, "write").mockImplementation(async (_p: string, d: any) => {
      enc = d instanceof Uint8Array ? d : new Uint8Array(d);
      return 0;
    });

    const encOut = await adapter.encrypt({ input: INPUT, output: ENC });
    expect(encOut).toEqual(ENC);
    expect(enc && enc.length > 12).toBe(true);

    let dec: Uint8Array | null = null;
    spyOn(Bun, "file").mockReturnValue({
      arrayBuffer: async () => enc!.buffer.slice(enc!.byteOffset, enc!.byteOffset + enc!.byteLength),
    } as any);
    spyOn(Bun, "write").mockImplementation(async (_p: string, d: any) => {
      dec = d instanceof Uint8Array ? d : new Uint8Array(d);
      return 0;
    });

    const decOut = await adapter.decrypt({ input: ENC, output: DEC });
    expect(decOut).toEqual(DEC);
    expect(decoder.decode(dec!)).toEqual(TEXT);
  });

  test("invalid payload", async () => {
    spyOn(Bun, "file").mockReturnValue({ arrayBuffer: async () => new Uint8Array(5).buffer } as any);

    expect(adapter.decrypt({ input: ENC, output: DEC })).rejects.toThrow(
      EncryptionBunAdapterError.InvalidPayload,
    );
  });
});
