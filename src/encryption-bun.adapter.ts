import type * as tools from "@bgord/tools";
import type { CryptoKeyProviderPort } from "./crypto-key-provider.port";
import type { EncryptionPort, EncryptionRecipe } from "./encryption.port";
import { EncryptionIV } from "./encryption-iv.vo";

export const EncryptionBunAdapterError = {
  InvalidPayload: "encryption.bun.adapter.invalid.payload",
  MissingFile: "encryption.bun.adapter.missing.file",
};

type Dependencies = { CryptoKeyProvider: CryptoKeyProviderPort };

export class EncryptionBunAdapter implements EncryptionPort {
  private static ALGORITHM = "AES-GCM";

  constructor(private readonly deps: Dependencies) {}

  async encrypt(recipe: EncryptionRecipe) {
    const key = await this.deps.CryptoKeyProvider.get();
    const iv = EncryptionIV.generate();

    const file = Bun.file(recipe.input.get());
    if (!(await file.exists())) throw new Error(EncryptionBunAdapterError.MissingFile);

    const plaintext = await file.arrayBuffer();

    const encrypted = await crypto.subtle.encrypt(
      { name: EncryptionBunAdapter.ALGORITHM, iv: iv.buffer as ArrayBuffer },
      key,
      plaintext,
    );

    const ciphertext = new Uint8Array(encrypted);
    // Combine IV + Ciphertext
    const output = new Uint8Array(iv.length + ciphertext.length);
    output.set(iv, 0);
    output.set(ciphertext, iv.length);

    await Bun.write(recipe.output.get(), output);

    return recipe.output;
  }

  async decrypt(recipe: EncryptionRecipe) {
    const decrypted = await this.decryptFile(recipe.input);
    await Bun.write(recipe.output.get(), new Uint8Array(decrypted));
    return recipe.output;
  }

  async view(input: tools.FilePathRelative | tools.FilePathAbsolute) {
    return this.decryptFile(input);
  }

  private async decryptFile(input: tools.FilePathRelative | tools.FilePathAbsolute): Promise<ArrayBuffer> {
    const key = await this.deps.CryptoKeyProvider.get();

    const file = Bun.file(input.get());
    if (!(await file.exists())) throw new Error(EncryptionBunAdapterError.MissingFile);

    const bytes = new Uint8Array(await file.arrayBuffer());

    // Payload must be at least IV length + 1 byte of content/tag
    if (bytes.length < EncryptionIV.LENGTH + 1) throw new Error(EncryptionBunAdapterError.InvalidPayload);

    const iv = bytes.subarray(0, EncryptionIV.LENGTH);
    const ivBuffer = iv.buffer.slice(iv.byteOffset, iv.byteOffset + iv.byteLength);

    const ciphertext = bytes.subarray(EncryptionIV.LENGTH);
    const ciphertextBuffer = ciphertext.buffer.slice(
      ciphertext.byteOffset,
      ciphertext.byteOffset + ciphertext.byteLength,
    );

    return crypto.subtle.decrypt(
      { name: EncryptionBunAdapter.ALGORITHM, iv: ivBuffer },
      key,
      ciphertextBuffer,
    );
  }
}
