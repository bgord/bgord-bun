import type { RandomnessStrategy } from "./randomness.strategy";

export class RandomnessNoopStrategy implements RandomnessStrategy {
  constructor(private readonly value: number) {}

  next(): number {
    return this.value;
  }
}
