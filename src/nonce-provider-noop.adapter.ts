import type { NonceProviderPort } from "./nonce-provider.port";

export class NonceProviderNoopAdapter implements NonceProviderPort {
  generate() {
    return "0000000000000000";
  }
}
