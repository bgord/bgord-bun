import { createCipheriv, randomBytes, scryptSync } from "node:crypto";
import cloneDeepWith from "lodash/cloneDeepWith";
import type { RedactorStrategy } from "./redactor.strategy";

export class RedactorEncryptionStrategy implements RedactorStrategy {
  private readonly secret: Buffer;

  constructor(
    secret: string,
    private readonly key: string,
  ) {
    this.secret = scryptSync(secret, "redactor_salt", 32);
  }

  async redact<T>(input: T): Promise<T> {
    const rootObject = Object(input);

    return cloneDeepWith(input, (value, key, parent) => {
      if (parent === rootObject && typeof key === "string" && key.toLowerCase() === this.key) {
        const iv = randomBytes(12);
        const cipher = createCipheriv("aes-256-gcm", this.secret, iv);
        const plaintext = Buffer.from(JSON.stringify(value), "utf8");
        const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
        const tag = cipher.getAuthTag();

        return `enc:gcm:${Buffer.concat([iv, tag, ciphertext]).toString("base64")}`;
      }

      return undefined;
    });
  }
}
