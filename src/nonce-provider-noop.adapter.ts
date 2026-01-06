import type { NonceProviderPort } from "./nonce-provider.port";
import { NonceValue } from "./nonce-value.vo";

export class NonceProviderNoopAdapter implements NonceProviderPort {
  generate() {
    return NonceValue.parse("0000000000000000");
  }
}
