import { describe, expect, test } from "bun:test";
import { Hash } from "../src/hash.vo";
import { SecureKeyGeneratorNoopAdapter } from "../src/secure-key-generator-noop.adapter";
import * as mocks from "./mocks";

describe("Hash VO", () => {
  test("fromBuffer", () => {
    const key = "00000000000000000000000000000000";
    const generator = new SecureKeyGeneratorNoopAdapter(new TextEncoder().encode(key));
    const buffer = generator.generate();

    const hash = Hash.fromBuffer(buffer);

    expect(Buffer.from(hash.get(), "hex").toString("utf-8")).toEqual(key);
  });

  test("fromValue", () => {
    expect(Hash.fromValue(mocks.hashValue).get()).toEqual(mocks.hashValue);
    expect(Hash.fromValue(mocks.hashValue).get()).toEqual(mocks.hashValue);
  });

  test("fromString", () => {
    expect(Hash.fromString(mocks.hashValue).get()).toEqual(mocks.hashValue);
  });

  test("fromString - invalid", () => {
    expect(() => Hash.fromString("xyz").get()).toThrow("hash.value.invalid.hex");
  });

  test("get", () => {
    expect(Hash.fromValue(mocks.hashValue).get()).toEqual(mocks.hashValue);
  });

  test("matches - true", () => {
    const first = Hash.fromValue(mocks.hashValue);
    const second = Hash.fromValue(mocks.hashValue);

    expect(first.matches(second)).toEqual(true);
  });

  test("matches - false", () => {
    const first = Hash.fromValue(mocks.hashValue);
    const second = Hash.fromString("1111111111111111111111111111111111111111111111111111111111111111");

    expect(first.matches(second)).toEqual(false);
  });

  test("toString", () => {
    expect(Hash.fromValue(mocks.hashValue).toString()).toEqual(mocks.hashValue);
  });

  test("toJSON", () => {
    expect(Hash.fromValue(mocks.hashValue).toJSON()).toEqual(mocks.hashValue);
  });
});
