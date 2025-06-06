import { describe, expect, test } from "bun:test";

import { Encryption, EncryptionIVType, EncryptionSecretType } from "../src/encryption";

const ORIGINAL_FILE = "tests/tmp/original.txt";
const ENCRYPTED_FILE = "tests/tmp/encrypted.txt";
const DECRYPTED_FILE = "tests/tmp/decrypted.txt";

const TEST_CONTENT = "Sensitive test data 🚀";

const SECRET: EncryptionSecretType = "supersecret";
const IV: EncryptionIVType = Buffer.alloc(16, 0);

const encryption = new Encryption({ secret: SECRET, iv: IV });

describe("Encryption", () => {
  test("encrypts and decrypts a file correctly", async () => {
    await Bun.file(ORIGINAL_FILE).write(TEST_CONTENT);

    await encryption.encrypt({ input: ORIGINAL_FILE, output: ENCRYPTED_FILE });

    expect(await Bun.file(ENCRYPTED_FILE).exists()).toBe(true);
    expect(await Bun.file(ENCRYPTED_FILE).text()).not.toBe(TEST_CONTENT);

    await encryption.decrypt({ input: ENCRYPTED_FILE, output: DECRYPTED_FILE });

    const decrypted = await Bun.file(DECRYPTED_FILE).text();
    expect(decrypted).toBe(TEST_CONTENT);

    await Bun.file(ORIGINAL_FILE).unlink();
    await Bun.file(ENCRYPTED_FILE).unlink();
    await Bun.file(DECRYPTED_FILE).unlink();
  });
});
