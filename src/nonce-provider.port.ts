import type { NonceValueType } from "./nonce-value.vo";

export interface NonceProviderPort {
  generate(): NonceValueType;
}
