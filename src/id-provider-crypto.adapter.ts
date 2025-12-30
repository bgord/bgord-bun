import type { IdProviderPort } from "./id-provider.port";
import type { UUIDType } from "./uuid.vo";

export class IdProviderCryptoAdapter implements IdProviderPort {
  generate(): UUIDType {
    return crypto.randomUUID();
  }
}
