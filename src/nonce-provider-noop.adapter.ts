import type { NonceProviderPort } from "./nonce-provider.port";
import { NonceValue, NonceValueType } from "./nonce-value.vo";

export class NonceProviderNoopAdapter implements NonceProviderPort {
  generate(): NonceValueType {
    return NonceValue.parse("0000000000000000");
  }
}
