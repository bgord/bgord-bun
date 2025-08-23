import type * as tools from "@bgord/tools";

export interface UserLanguageQueryPort {
  get(userId: tools.LanguageType): Promise<tools.LanguageType | null>;
}
