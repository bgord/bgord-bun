import { HashValue, type HashValueType } from "./hash-value.vo";

export class Hash {
  private constructor(private readonly value: HashValueType) {}

  static fromBuffer(value: Uint8Array): Hash {
    return Hash.fromString(value.toHex());
  }

  static fromValue(value: HashValueType): Hash {
    return new Hash(value);
  }

  static fromString(candidate: string): Hash {
    return new Hash(HashValue.parse(candidate));
  }

  get(): HashValueType {
    return this.value;
  }

  matches(another: Hash): boolean {
    return this.value === another.value;
  }

  toString(): string {
    return this.value;
  }

  toJSON(): string {
    return this.value;
  }
}
