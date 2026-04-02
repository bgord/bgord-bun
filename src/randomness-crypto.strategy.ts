import type { RandomnessStrategy } from "./randomness.strategy";

export class RandomnessCryptoStrategy implements RandomnessStrategy {
  next(): number {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return (array[0] ?? 0) / 0x100000000;
  }
}
