import type * as tools from "@bgord/tools";
import type { UUIDType } from "../../../uuid.vo";
import type * as Ports from "../ports";
import type * as VO from "../value-objects";

export interface UserLanguagePort<L extends readonly tools.LanguageType[]> {
  get(userId: UUIDType): Promise<L[number]>;
}

export class UserLanguageAdapter<L extends readonly tools.LanguageType[]> implements UserLanguagePort<L> {
  constructor(
    private readonly query: Ports.UserLanguageQueryPort,
    private readonly validator: VO.SupportedLanguagesSet<L>,
    private readonly resolver: Ports.UserLanguageResolverPort,
  ) {}

  async get(userId: UUIDType): Promise<L[number]> {
    const stored = await this.query.get(userId);
    const candidate = await this.resolver.resolve(stored);

    return this.validator.ensure(candidate);
  }
}
