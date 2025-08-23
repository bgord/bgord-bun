export interface UserLanguageResolverPort {
  resolve(input: string | null): string | Promise<string>;
}

/** @public */
export class UserLanguagePreferenceMissingError extends Error {
  constructor() {
    super();
    Object.setPrototypeOf(this, UserLanguagePreferenceMissingError.prototype);
  }
}

/** @public */
export class UserLanguageResolverThrowIfMissing implements UserLanguageResolverPort {
  resolve(stored: string | null) {
    if (stored == null) throw new UserLanguagePreferenceMissingError();
    return stored;
  }
}

export class UserLanguageResolverSystemDefaultFallback implements UserLanguageResolverPort {
  constructor(private readonly systemDefaultLanguage: string) {}

  resolve(stored: string | null) {
    return stored ?? this.systemDefaultLanguage;
  }
}
