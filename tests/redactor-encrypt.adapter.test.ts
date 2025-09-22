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
  test("roundtrip: encrypts top-level target and decrypts back to original", () => {
    const input = {
      metadata: { headers: { Authorization: "Bearer xyz" }, client: { ip: "1.2.3.4" } },
      keep: 123,
    };

    const result = adapter.redact(input);

    expect(typeof result.metadata).toBe("string");
    expect(result.keep).toBe(123);
    expect(input.metadata.client.ip).toBe("1.2.3.4");

    expect(decrypt(result.metadata as unknown as string, secret)).toEqual(input.metadata);
  });

  test("only top-level target is encrypted; nested same-name keys stay plain", () => {
    const result = adapter.redact({ nested: { metadata: { a: 1 } }, metadata: { b: 2 } });

    expect(typeof result.metadata).toBe("string");
    expect(result.nested.metadata).toEqual({ a: 1 });
  });

  test("random IV: same input produces different ciphertexts, same plaintext after decrypt", () => {
    const input = { metadata: { x: 1 } };

    const a = adapter.redact(input);
    const b = adapter.redact(input);

    expect(a.metadata).not.toBe(b.metadata);
    expect(decrypt(a.metadata as unknown as string, secret)).toEqual(input.metadata);
    expect(decrypt(b.metadata as unknown as string, secret)).toEqual(input.metadata);
  });
});
