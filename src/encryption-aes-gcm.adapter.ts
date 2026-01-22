import type * as tools from "@bgord/tools";
import { CryptoAesGcm } from "./crypto-aes-gcm.service";
import type { CryptoKeyProviderPort } from "./crypto-key-provider.port";
import type { EncryptionPort, EncryptionRecipe } from "./encryption.port";
import { EncryptionIV } from "./encryption-iv.vo";
import type { FileInspectionPort } from "./file-inspection.port";

type Dependencies = { CryptoKeyProvider: CryptoKeyProviderPort; FileInspection: FileInspectionPort };

export const EncryptionAesGcmAdapterError = { MissingFile: "encryption.aes.gcm.adapter.missing.file" };

export class EncryptionAesGcmAdapter implements EncryptionPort {
  constructor(private readonly deps: Dependencies) {}

  async encrypt(recipe: EncryptionRecipe): Promise<tools.FilePathRelative | tools.FilePathAbsolute> {
    const key = await this.deps.CryptoKeyProvider.get();
    const iv = EncryptionIV.generate();

    const exists = await this.deps.FileInspection.exists(recipe.input);
    if (!exists) throw new Error(EncryptionAesGcmAdapterError.MissingFile);

    const plaintext = await Bun.file(recipe.input.get()).arrayBuffer();
    const output = await CryptoAesGcm.encrypt(key, plaintext, iv);

    await Bun.write(recipe.output.get(), output);

    return recipe.output;
  }

  async decrypt(recipe: EncryptionRecipe): Promise<tools.FilePathRelative | tools.FilePathAbsolute> {
    const key = await this.deps.CryptoKeyProvider.get();

    const exists = await this.deps.FileInspection.exists(recipe.input);
    if (!exists) throw new Error(EncryptionAesGcmAdapterError.MissingFile);

    const bytes = new Uint8Array(await Bun.file(recipe.input.get()).arrayBuffer());

    const decrypted = await CryptoAesGcm.decrypt(key, bytes);

    await Bun.write(recipe.output.get(), decrypted);

    return recipe.output;
  }

  async view(input: tools.FilePathRelative | tools.FilePathAbsolute): Promise<ArrayBuffer> {
    const key = await this.deps.CryptoKeyProvider.get();

    const exists = await this.deps.FileInspection.exists(input);
    if (!exists) throw new Error(EncryptionAesGcmAdapterError.MissingFile);

    const bytes = new Uint8Array(await Bun.file(input.get()).arrayBuffer());

    return CryptoAesGcm.decrypt(key, bytes);
  }
}
