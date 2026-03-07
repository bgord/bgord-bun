import type * as tools from "@bgord/tools";
import type { Languages } from "../../../languages.vo";

export interface UserLanguageResolverPort {
  resolve(input: tools.LanguageType | null): tools.LanguageType | Promise<tools.LanguageType>;
}

export const UserLanguagePreferenceError = { Missing: "user.language.preference.missing" };

export class UserLanguageResolverThrowIfMissing implements UserLanguageResolverPort {
  resolve(stored: tools.LanguageType | null) {
    if (stored == null) throw new Error(UserLanguagePreferenceError.Missing);
    return stored;
  }
}

export class UserLanguageResolverSystemDefaultFallback<T extends tools.LanguageType>
  implements UserLanguageResolverPort
{
  constructor(private readonly languages: Languages<T>) {}

  resolve(stored: tools.LanguageType | null) {
    return stored ?? this.languages.fallback;
  }
}
