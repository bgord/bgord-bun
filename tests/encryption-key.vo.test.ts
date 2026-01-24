import { describe, expect, test } from "bun:test";
import { EncryptionKey } from "../src/encryption-key.vo";
import { EncryptionKeyValue } from "../src/encryption-key-value.vo";

const HEX = EncryptionKeyValue.parse("a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90");
const ANOTHER_HEX = EncryptionKeyValue.parse(
  "a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f91",
);
const BUFFER = new Uint8Array([
  161, 178, 195, 212, 229, 246, 7, 24, 41, 58, 75, 92, 109, 126, 143, 144, 161, 178, 195, 212, 229, 246, 7,
  24, 41, 58, 75, 92, 109, 126, 143, 144,
]);

describe("EncryptionKey VO", () => {
  test("fromStringSafe", () => {
    expect(() => EncryptionKey.fromStringSafe(HEX)).not.toThrow();
  });

  test("fromString", () => {
    expect(() => EncryptionKey.fromString(HEX)).not.toThrow();
  });

  test("fromString - invalid hex", () => {
    expect(() => EncryptionKey.fromString("abc")).toThrow("encryption.key.value.invalid.hex");
  });

  test("fromBuffer", () => {
    expect(() => EncryptionKey.fromBuffer(BUFFER)).not.toThrow();
  });

  test("fromBuffer - invalid length", () => {
    expect(() => EncryptionKey.fromBuffer(new Uint8Array(31))).toThrow("encryption.key.invalid.buffer");
  });

  test("toBytes", () => {
    expect(EncryptionKey.fromStringSafe(HEX).toBytes()).toEqual(BUFFER);
  });

  test("back and forth", () => {
    const key = EncryptionKey.fromStringSafe(HEX);
    const buffer = key.toBytes();

    expect(key.equals(EncryptionKey.fromBuffer(buffer))).toEqual(true);
  });

  test("equals - true", () => {
    expect(EncryptionKey.fromStringSafe(HEX).equals(EncryptionKey.fromStringSafe(HEX))).toEqual(true);
  });

  test("equals - true", () => {
    expect(EncryptionKey.fromStringSafe(HEX).equals(EncryptionKey.fromStringSafe(ANOTHER_HEX))).toEqual(
      false,
    );
  });

  test("toString", () => {
    expect(EncryptionKey.fromStringSafe(HEX).toString()).toEqual("EncryptionKey");
  });

  test("toJSON", () => {
    expect(EncryptionKey.fromStringSafe(HEX).toJSON()).toEqual("EncryptionKey");
  });
});
