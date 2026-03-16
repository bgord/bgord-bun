import * as tools from "@bgord/tools";
import * as v from "valibot";
import type { Hash } from "./hash.vo";

export class HashBucket {
  private constructor(readonly value: tools.IntegerNonNegativeType) {}

  static fromHash(hash: Hash): HashBucket {
    const hex = hash.get().substring(0, 8);
    const integer = Number.parseInt(hex, 16);

    const bucket = integer % 100;

    return new HashBucket(v.parse(tools.IntegerNonNegative, bucket));
  }

  isLessThan(threshold: tools.IntegerNonNegativeType): boolean {
    return this.value < threshold;
  }
}
