import type * as tools from "@bgord/tools";
import type { Secret } from "./secret.vo";
import type { SecretManagerPort } from "./secret-manager.port";

export class SecretManagerNoopAdapter implements SecretManagerPort {
  constructor(private readonly secrets: Record<tools.ObjectKeyType, string> = {}) {}

  async get<T>(secret: Secret<T>): Promise<T> {
    return secret.schema.parse(this.secrets[secret.key]);
  }
}
