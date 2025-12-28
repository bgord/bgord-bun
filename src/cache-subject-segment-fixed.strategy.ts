import type { CacheSubjectSegmentStrategy } from "./cache-subject-segment.strategy";

export class CacheSubjectSegmentFixedStrategy implements CacheSubjectSegmentStrategy {
  constructor(private readonly value: string) {}

  create() {
    return this.value;
  }
}
