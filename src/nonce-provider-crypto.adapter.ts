import type { NonceProviderPort } from "./nonce-provider.port";
import { NonceValue } from "./nonce-value.vo";

export class NonceProviderCryptoAdapter implements NonceProviderPort {
  generate() {
    const buffer = new Uint8Array(8);

    crypto.getRandomValues(buffer);

    const nonce = Array.from(buffer)
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");

    return NonceValue.parse(nonce);
  }
}
