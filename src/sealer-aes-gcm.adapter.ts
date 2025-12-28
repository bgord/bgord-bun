import { CryptoAesGcm } from "./crypto-aes-gcm.service";
import type { CryptoKeyProviderPort } from "./crypto-key-provider.port";
import { EncryptionIV } from "./encryption-iv.vo";
import type { SealerPort } from "./sealer.port";

type Dependencies = { CryptoKeyProvider: CryptoKeyProviderPort };

export const SealerAesGcmAdapterError = { InvalidPayload: "sealer.aes.gcm.adapter.invalid.payload" };

export class SealerAesGcmAdapter implements SealerPort {
  private static readonly PREFIX = "sealed:gcm:";

  constructor(private readonly deps: Dependencies) {}

  async seal(value: unknown): Promise<string> {
    const key = await this.deps.CryptoKeyProvider.get();

    const iv = EncryptionIV.generate();
    const plaintext = new TextEncoder().encode(JSON.stringify(value));

    const payload = await CryptoAesGcm.encrypt(key, plaintext.buffer, iv);

    return SealerAesGcmAdapter.PREFIX + Buffer.from(payload).toString("base64");
  }

  async unseal(value: string): Promise<unknown> {
    if (!value.startsWith(SealerAesGcmAdapter.PREFIX)) {
      throw new Error(SealerAesGcmAdapterError.InvalidPayload);
    }

    const key = await this.deps.CryptoKeyProvider.get();
    const bytes = Buffer.from(value.slice(SealerAesGcmAdapter.PREFIX.length), "base64");

    const decrypted = await CryptoAesGcm.decrypt(key, new Uint8Array(bytes));

    return JSON.parse(new TextDecoder().decode(decrypted));
  }
}
