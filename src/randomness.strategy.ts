export interface RandomnessStrategy {
  // Returns a number in the [0, 1) range
  next(): number;
}
