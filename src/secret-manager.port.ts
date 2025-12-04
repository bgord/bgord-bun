import type { Secret } from "./secret.vo";

export interface SecretManagerPort {
  get<T>(secret: Secret<T>): Promise<T>;
}
