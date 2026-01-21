import type { NonceProviderPort } from "./nonce-provider.port";
import { NonceValue, type NonceValueType } from "./nonce-value.vo";

export class NonceProviderCryptoAdapter implements NonceProviderPort {
  generate(): NonceValueType {
    const buffer = new Uint8Array(8);

    crypto.getRandomValues(buffer);

    const nonce = Array.from(buffer)
      // Stryker disable all
      .map((byte) => byte.toString(16).padStart(2, "0"))
      // Stryker restore all
      .join("");

    return NonceValue.parse(nonce);
  }
}
