import type * as tools from "@bgord/tools";

export interface UserLanguageResolverPort {
  resolve(input: tools.LanguageType | null): tools.LanguageType | Promise<tools.LanguageType>;
}

export class UserLanguagePreferenceMissingError extends Error {
  constructor() {
    super();
    Object.setPrototypeOf(this, UserLanguagePreferenceMissingError.prototype);
  }
}

export class UserLanguageResolverThrowIfMissing implements UserLanguageResolverPort {
  resolve(stored: tools.LanguageType | null) {
    if (stored == null) throw new UserLanguagePreferenceMissingError();
    return stored;
  }
}

export class UserLanguageResolverSystemDefaultFallback implements UserLanguageResolverPort {
  constructor(private readonly systemDefaultLanguage: tools.LanguageType) {}

  resolve(stored: tools.LanguageType | null) {
    return stored ?? this.systemDefaultLanguage;
  }
}
