import type * as tools from "@bgord/tools";
import { CryptoAesGcm } from "./crypto-aes-gcm.service";
import type { CryptoKeyProviderPort } from "./crypto-key-provider.port";
import type { EncryptionPort, EncryptionRecipe } from "./encryption.port";
import { EncryptionIV } from "./encryption-iv.vo";
import type { FileInspectionPort } from "./file-inspection.port";
import type { FileReaderRawPort } from "./file-reader-raw.port";
import type { FileWriterPort } from "./file-writer.port";

type Dependencies = {
  FileReaderRaw: FileReaderRawPort;
  FileWriter: FileWriterPort;
  CryptoKeyProvider: CryptoKeyProviderPort;
  FileInspection: FileInspectionPort;
};

export const EncryptionAesGcmAdapterError = { MissingFile: "encryption.aes.gcm.adapter.missing.file" };

export class EncryptionAesGcmAdapter implements EncryptionPort {
  constructor(private readonly deps: Dependencies) {}

  async encrypt(recipe: EncryptionRecipe): Promise<tools.FilePathRelative | tools.FilePathAbsolute> {
    const exists = await this.deps.FileInspection.exists(recipe.input);
    if (!exists) throw new Error(EncryptionAesGcmAdapterError.MissingFile);

    const key = await this.deps.CryptoKeyProvider.get();
    const iv = EncryptionIV.generate();

    const plaintext = await this.deps.FileReaderRaw.read(recipe.input);
    const encrypted = await CryptoAesGcm.encrypt(key, plaintext, iv);

    await this.deps.FileWriter.write(recipe.output, encrypted);

    return recipe.output;
  }

  async decrypt(recipe: EncryptionRecipe): Promise<tools.FilePathRelative | tools.FilePathAbsolute> {
    const exists = await this.deps.FileInspection.exists(recipe.input);
    if (!exists) throw new Error(EncryptionAesGcmAdapterError.MissingFile);

    const key = await this.deps.CryptoKeyProvider.get();

    const encrypted = new Uint8Array(await this.deps.FileReaderRaw.read(recipe.input));
    const plaintext = await CryptoAesGcm.decrypt(key, encrypted);

    await this.deps.FileWriter.write(recipe.output, plaintext);

    return recipe.output;
  }

  async view(input: tools.FilePathRelative | tools.FilePathAbsolute): Promise<ArrayBuffer> {
    const exists = await this.deps.FileInspection.exists(input);
    if (!exists) throw new Error(EncryptionAesGcmAdapterError.MissingFile);

    const key = await this.deps.CryptoKeyProvider.get();

    const encrypted = new Uint8Array(await this.deps.FileReaderRaw.read(input));

    return CryptoAesGcm.decrypt(key, encrypted);
  }
}
