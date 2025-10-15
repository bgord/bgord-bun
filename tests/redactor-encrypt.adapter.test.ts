import { describe, expect, test } from "bun:test";
import { createDecipheriv, scryptSync } from "node:crypto";
import { RedactorEncryptionAdapter } from "../src/redactor-encrypt.adapter";

function decrypt(enc: string, secret: string) {
  const b64 = enc.replace(/^enc:gcm:/, "");
  const buf = Buffer.from(b64, "base64");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const ct = buf.subarray(28);
  const key = scryptSync(secret, "redactor_salt", 32);
  const d = createDecipheriv("aes-256-gcm", key, iv);
  d.setAuthTag(tag);
  const pt = Buffer.concat([d.update(ct), d.final()]);
  return JSON.parse(pt.toString("utf8"));
}

const secret = "secret";
const adapter = new RedactorEncryptionAdapter("secret", "metadata");

describe("RedactorEncryptionAdapter", () => {
  test("happy path", () => {
    const result = adapter.redact({ nested: { metadata: { a: 1 } }, metadata: { b: 2 } });

    expect(typeof result.metadata).toEqual("string");
    expect(result.nested.metadata).toEqual({ a: 1 });
  });

  test("roundtrip", () => {
    const input = {
      metadata: { headers: { Authorization: "Bearer xyz" }, client: { ip: "1.2.3.4" } },
      keep: 123,
    };

    const result = adapter.redact(input);

    expect(typeof result.metadata).toEqual("string");
    expect(result.keep).toEqual(123);
    expect(input.metadata.client.ip).toEqual("1.2.3.4");

    expect(decrypt(result.metadata as unknown as string, secret)).toEqual(input.metadata);
  });
});
