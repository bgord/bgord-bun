import type * as Ports from "../ports";
import type * as VO from "../value-objects";

// TODO
export interface UserLanguagePort<L extends readonly string[]> {
  get(userId: string): Promise<L[number]>;
}

export class UserLanguageAdapter<L extends readonly string[]> implements UserLanguagePort<L> {
  constructor(
    private readonly query: Ports.UserLanguageQueryPort,
    private readonly validator: VO.SupportedLanguagesSet<L>,
    private readonly resolver: Ports.UserLanguageResolverPort,
  ) {}

  async get(userId: string): Promise<L[number]> {
    const stored = await this.query.get(userId);
    const candidate = await this.resolver.resolve(stored);

    return this.validator.ensure(candidate);
  }
}
