import * as v from "valibot";
import type { NonceProviderPort } from "./nonce-provider.port";
import { NonceValue, type NonceValueType } from "./nonce-value.vo";

export class NonceProviderCryptoAdapter implements NonceProviderPort {
  generate(): NonceValueType {
    const buffer = new Uint8Array(8);
    crypto.getRandomValues(buffer);

    return v.parse(NonceValue, buffer.toHex());
  }
}
