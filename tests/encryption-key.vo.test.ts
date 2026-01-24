import { describe, expect, test } from "bun:test";
import { EncryptionKey } from "../src/encryption-key.vo";
import { EncryptionKeyValue } from "../src/encryption-key-value.vo";

const hex = EncryptionKeyValue.parse("a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90");
const anotherHex = EncryptionKeyValue.parse(
  "a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f91",
);
const bytes = new Uint8Array([
  161, 178, 195, 212, 229, 246, 7, 24, 41, 58, 75, 92, 109, 126, 143, 144, 161, 178, 195, 212, 229, 246, 7,
  24, 41, 58, 75, 92, 109, 126, 143, 144,
]);

describe("EncryptionKey VO", () => {
  test("fromStringSafe", () => {
    expect(() => EncryptionKey.fromStringSafe(hex)).not.toThrow();
  });

  test("fromString", () => {
    expect(() => EncryptionKey.fromString(hex)).not.toThrow();
  });

  test("fromString - invalid hex", () => {
    expect(() => EncryptionKey.fromString("abc")).toThrow("encryption.key.value.invalid.hex");
  });

  test("fromBytes", () => {
    expect(() => EncryptionKey.fromBytes(bytes)).not.toThrow();
  });

  test("fromBytes - invalid length", () => {
    expect(() => EncryptionKey.fromBytes(new Uint8Array(31))).toThrow("encryption.key.invalid.buffer");
  });

  test("toBytes", () => {
    expect(EncryptionKey.fromStringSafe(hex).toBytes()).toEqual(bytes);
  });

  test("back and forth", () => {
    const key = EncryptionKey.fromStringSafe(hex);
    const buffer = key.toBytes();

    expect(key.equals(EncryptionKey.fromBytes(buffer))).toEqual(true);
  });

  test("equals - true", () => {
    expect(EncryptionKey.fromStringSafe(hex).equals(EncryptionKey.fromStringSafe(hex))).toEqual(true);
  });

  test("equals - true", () => {
    expect(EncryptionKey.fromStringSafe(hex).equals(EncryptionKey.fromStringSafe(anotherHex))).toEqual(false);
  });

  test("toString", () => {
    expect(EncryptionKey.fromStringSafe(hex).toString()).toEqual("EncryptionKey");
  });

  test("toJSON", () => {
    expect(EncryptionKey.fromStringSafe(hex).toJSON()).toEqual("EncryptionKey");
  });
});
