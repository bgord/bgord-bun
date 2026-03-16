import * as v from "valibot";
import type { NonceProviderPort } from "./nonce-provider.port";
import { NonceValue, type NonceValueType } from "./nonce-value.vo";

export class NonceProviderNoopAdapter implements NonceProviderPort {
  generate(): NonceValueType {
    return v.parse(NonceValue, "0000000000000000");
  }
}
