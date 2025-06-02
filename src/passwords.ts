import { z } from "zod/v4";

export type PasswordType = string;
type HashedPasswordType = string;

export class Password {
  private schema: z.ZodSchema = z.string().min(1).max(256);

  private value: PasswordType;

  constructor(value: PasswordType, schema?: z.ZodSchema) {
    this.schema = schema ?? this.schema;
    this.value = this.schema.parse(value) as PasswordType;
  }

  async hash(): Promise<HashedPassword> {
    return HashedPassword.fromPassword(this);
  }

  read(): PasswordType {
    return this.value;
  }
}

export class HashedPassword {
  private constructor(private value: HashedPasswordType) {}

  static async fromPassword(password: Password) {
    const hash = await Bun.password.hash(password.read());

    return new HashedPassword(hash);
  }

  static async fromHash(value: HashedPasswordType) {
    return new HashedPassword(value);
  }

  read(): HashedPasswordType {
    return this.value;
  }

  async matches(password: Password): Promise<boolean> {
    return Bun.password.verify(password.read(), this.read());
  }

  async matchesOrThrow(password: Password): Promise<true> {
    const matches = await Bun.password.verify(password.read(), this.read());

    if (!matches) {
      throw new Error("HashedPassword does not match the provided password");
    }

    return true;
  }
}
