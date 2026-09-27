export class RedactorKey {
  private constructor(private readonly value: string) {}

  static fromString(candidate: string): RedactorKey {
    return new RedactorKey(candidate.toLowerCase().replace(/[_-]/g, ""));
  }

  get(): string {
    return this.value;
  }

  matches(another: RedactorKey): boolean {
    return this.value === another.value;
  }
}
