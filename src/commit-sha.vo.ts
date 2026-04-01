import * as v from "valibot";
import { CommitShaValue, type CommitShaValueType } from "./commit-sha-value.vo";

export class CommitSha {
  private constructor(private readonly inner: CommitShaValueType) {}

  static fromString(candidate: string): CommitSha {
    return new CommitSha(v.parse(CommitShaValue, candidate));
  }

  static fromStringSafe(value: CommitShaValueType): CommitSha {
    return new CommitSha(value);
  }

  equals(another: CommitSha): boolean {
    return this.inner === another.inner;
  }

  toShortString(length = 7): string {
    return this.inner.slice(0, length);
  }

  get value(): CommitShaValueType {
    return this.inner;
  }

  toString(): string {
    return this.inner;
  }

  toJSON(): string {
    return this.inner;
  }
}
