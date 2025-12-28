import type * as tools from "@bgord/tools";
import { CryptoAesGcm } from "./crypto-aes-gcm.service";
import type { CryptoKeyProviderPort } from "./crypto-key-provider.port";
import type { EncryptionPort, EncryptionRecipe } from "./encryption.port";
import { EncryptionIV } from "./encryption-iv.vo";

type Dependencies = { CryptoKeyProvider: CryptoKeyProviderPort };

export const EncryptionAesGcmAdapterError = { MissingFile: "encryption.aes.gcm.adapter.missing.file" };

export class EncryptionAesGcmAdapter implements EncryptionPort {
  constructor(private readonly deps: Dependencies) {}

  async encrypt(recipe: EncryptionRecipe) {
    const key = await this.deps.CryptoKeyProvider.get();
    const iv = EncryptionIV.generate();

    const file = Bun.file(recipe.input.get());
    const exists = await file.exists();
    if (!exists) throw new Error(EncryptionAesGcmAdapterError.MissingFile);

    const plaintext = await file.arrayBuffer();
    const output = await CryptoAesGcm.encrypt(key, plaintext, iv);

    await Bun.write(recipe.output.get(), output);

    return recipe.output;
  }

  async decrypt(recipe: EncryptionRecipe) {
    const key = await this.deps.CryptoKeyProvider.get();

    const file = Bun.file(recipe.input.get());
    const exists = await file.exists();
    if (!exists) throw new Error(EncryptionAesGcmAdapterError.MissingFile);

    const bytes = new Uint8Array(await file.arrayBuffer());

    const decrypted = await CryptoAesGcm.decrypt(key, bytes);

    await Bun.write(recipe.output.get(), decrypted);

    return recipe.output;
  }

  async view(input: tools.FilePathRelative | tools.FilePathAbsolute) {
    const key = await this.deps.CryptoKeyProvider.get();

    const file = Bun.file(input.get());
    const exists = await file.exists();
    if (!exists) throw new Error(EncryptionAesGcmAdapterError.MissingFile);

    const bytes = new Uint8Array(await file.arrayBuffer());

    return CryptoAesGcm.decrypt(key, bytes);
  }
}
