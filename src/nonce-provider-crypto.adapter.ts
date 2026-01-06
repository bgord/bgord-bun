import type { NonceProviderPort } from "./nonce-provider.port";

export class NonceProviderCryptoAdapter implements NonceProviderPort {
  generate() {
    const buffer = new Uint8Array(8);

    crypto.getRandomValues(buffer);

    return Array.from(buffer)
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }
}
