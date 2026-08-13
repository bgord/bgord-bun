import * as v from "valibot";
import type { IdProviderPort } from "./id-provider.port";
import { UUID, type UUIDType } from "./uuid.vo";

export class IdProviderCryptoAdapter implements IdProviderPort {
  generate(): UUIDType {
    return v.parse(UUID, crypto.randomUUID());
  }
}
