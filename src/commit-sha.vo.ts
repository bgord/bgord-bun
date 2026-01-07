import { CommitShaValue, type CommitShaValueType } from "./commit-sha-value.vo";

export class CommitSha {
  private constructor(private readonly value: CommitShaValueType) {}

  static fromString(candidate: string): CommitSha {
    return new CommitSha(CommitShaValue.parse(candidate));
  }

  static fromStringSafe(value: CommitShaValueType): CommitSha {
    return new CommitSha(value);
  }

  equals(another: CommitSha): boolean {
    return this.value === another.value;
  }

  toShortString(length = 7): string {
    return this.value.slice(0, length);
  }

  toString(): CommitShaValueType {
    return this.value;
  }

  toJSON(): string {
    return this.value;
  }
}
