import type { IdProviderPort } from "./id-provider.port";

export class IdProviderCryptoAdapter implements IdProviderPort {
  generate() {
    return crypto.randomUUID();
  }
}
