import { describe, expect, test } from "bun:test";
import * as fs from "node:fs";
import * as path from "node:path";
import { Encryption, EncryptionIVType, EncryptionSecretType } from "../src/encryption";

const TEMP_DIR = "tmp";
const ORIGINAL_FILE = path.join(TEMP_DIR, "original.txt");
const ENCRYPTED_FILE = path.join(TEMP_DIR, "encrypted.txt");
const DECRYPTED_FILE = path.join(TEMP_DIR, "decrypted.txt");

const TEST_CONTENT = "Sensitive test data 🚀";

const SECRET: EncryptionSecretType = "supersecret";
const IV: EncryptionIVType = Buffer.alloc(16, 0);

const encryption = new Encryption({ secret: SECRET, iv: IV });

describe("Encryption", () => {
  test("encrypts and decrypts a file correctly", async () => {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
    fs.writeFileSync(ORIGINAL_FILE, TEST_CONTENT);

    await encryption.encrypt({ input: ORIGINAL_FILE, output: ENCRYPTED_FILE });

    expect(fs.existsSync(ENCRYPTED_FILE)).toBe(true);
    expect(fs.readFileSync(ENCRYPTED_FILE).toString()).not.toBe(TEST_CONTENT);

    await encryption.decrypt({ input: ENCRYPTED_FILE, output: DECRYPTED_FILE });

    const decrypted = fs.readFileSync(DECRYPTED_FILE, "utf8");
    expect(decrypted).toBe(TEST_CONTENT);

    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  });
});
