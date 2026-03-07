import type * as tools from "@bgord/tools";

export interface UserLanguageQueryPort {
  get(userId: string): Promise<tools.LanguageType | null>;
}
