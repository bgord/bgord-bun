import type { RandomnessStrategy } from "./randomness.strategy";

export class RandomnessMathStrategy implements RandomnessStrategy {
  next(): number {
    return Math.random();
  }
}
