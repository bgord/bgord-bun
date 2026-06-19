import type * as tools from "@bgord/tools";
import type { Languages } from "../../../languages.vo";
import type { UUIDType } from "../../../uuid.vo";
import type * as Ports from "../ports";

export const UserLanguageAdapterError = { Missing: "user.language.ohq.error.missing" };

export interface UserLanguagePort<T extends tools.LanguageType> {
  get(userId: UUIDType): Promise<T>;
}

export class UserLanguageAdapter<T extends tools.LanguageType> implements UserLanguagePort<T> {
  constructor(
    private readonly languages: Languages<T>,
    private readonly query: Ports.UserLanguageQueryPort,
    private readonly resolver: Ports.UserLanguageResolverPort,
  ) {}

  async get(userId: UUIDType): Promise<T> {
    const stored = await this.query.get(userId);
    const candidate = await this.resolver.resolve(stored);

    if (!this.languages.isSupported(candidate)) throw new Error(UserLanguageAdapterError.Missing);
    return candidate;
  }
}
