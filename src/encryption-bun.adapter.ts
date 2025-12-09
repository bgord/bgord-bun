import type * as tools from "@bgord/tools";
import type { CryptoKeyProviderPort } from "./crypto-key-provider.port";
import type { EncryptionPort, EncryptionRecipe } from "./encryption.port";
import { EncryptionIV } from "./encryption-iv.vo";

export const EncryptionBunAdapterError = { InvalidPayload: "encryption.bun.adapter.invalid.payload" };

type Dependencies = { CryptoKeyProvider: CryptoKeyProviderPort };

export class EncryptionBunAdapter implements EncryptionPort {
  constructor(private readonly deps: Dependencies) {}

  async encrypt(recipe: EncryptionRecipe) {
    const key = await this.deps.CryptoKeyProvider.get();
    const iv = EncryptionIV.generate();

    const plaintext = await Bun.file(recipe.input.get()).arrayBuffer();

    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv.buffer as ArrayBuffer },
      key,
      plaintext,
    );

    const ciphertext = new Uint8Array(encrypted);
    const output = new Uint8Array(iv.length + ciphertext.length);
    output.set(iv, 0);
    output.set(ciphertext, iv.length);

    await Bun.write(recipe.output.get(), output);

    return recipe.output;
  }

  async decrypt(recipe: EncryptionRecipe) {
    const key = await this.deps.CryptoKeyProvider.get();

    const bytes = new Uint8Array(await Bun.file(recipe.input.get()).arrayBuffer());
    if (bytes.length < EncryptionIV.LENGTH + 1) throw new Error(EncryptionBunAdapterError.InvalidPayload);

    const iv = bytes.subarray(0, EncryptionIV.LENGTH);
    const ivBuffer = iv.buffer.slice(iv.byteOffset, iv.byteOffset + iv.byteLength);

    const ciphertext = bytes.subarray(EncryptionIV.LENGTH);

    const ciphertextBuffer = ciphertext.buffer.slice(
      ciphertext.byteOffset,
      ciphertext.byteOffset + ciphertext.byteLength,
    );

    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: ivBuffer }, key, ciphertextBuffer);

    await Bun.write(recipe.output.get(), new Uint8Array(decrypted));

    return recipe.output;
  }

  async view(input: tools.FilePathRelative | tools.FilePathAbsolute) {
    const key = await this.deps.CryptoKeyProvider.get();

    const bytes = new Uint8Array(await Bun.file(input.get()).arrayBuffer());
    if (bytes.length < EncryptionIV.LENGTH + 1) throw new Error(EncryptionBunAdapterError.InvalidPayload);

    const iv = bytes.subarray(0, EncryptionIV.LENGTH);
    const ivBuffer = iv.buffer.slice(iv.byteOffset, iv.byteOffset + iv.byteLength);

    const ciphertext = bytes.subarray(EncryptionIV.LENGTH);

    const ciphertextBuffer = ciphertext.buffer.slice(
      ciphertext.byteOffset,
      ciphertext.byteOffset + ciphertext.byteLength,
    );

    return crypto.subtle.decrypt({ name: "AES-GCM", iv: ivBuffer }, key, ciphertextBuffer);
  }
}
