import { describe, expect, spyOn, test } from "bun:test";
import * as Preferences from "../src/modules/preferences";

/** @public */
export enum SupportedLanguages {
  en = "en",
  pl = "pl",
}

export const SUPPORTED_LANGUAGES = [SupportedLanguages.en, SupportedLanguages.pl] as const;

class UserLanguageQueryAdapterNoop implements Preferences.Ports.UserLanguageQueryPort {
  async get(_userId: string) {
    return SupportedLanguages.en;
  }
}

const UserLanguageQueryAdapter = new UserLanguageQueryAdapterNoop();

describe("UserLanguageOHQ", () => {
  test("happy path", async () => {
    spyOn(UserLanguageQueryAdapter, "get").mockResolvedValue(SupportedLanguages.pl);

    const UserLanguageOHQ = new Preferences.OHQ.UserLanguageAdapter(
      UserLanguageQueryAdapter,
      new Preferences.VO.SupportedLanguagesSet(SUPPORTED_LANGUAGES),
      new Preferences.Ports.UserLanguageResolverThrowIfMissing(),
    );

    const language = await UserLanguageOHQ.get(crypto.randomUUID());
    expect(language).toEqual(SupportedLanguages.pl);
  });

  test("UserLanguageResolverThrowIfMissing", async () => {
    // @ts-expect-error
    spyOn(UserLanguageQueryAdapter, "get").mockResolvedValue(null);

    const UserLanguageOHQ = new Preferences.OHQ.UserLanguageAdapter(
      UserLanguageQueryAdapter,
      new Preferences.VO.SupportedLanguagesSet(SUPPORTED_LANGUAGES),
      new Preferences.Ports.UserLanguageResolverThrowIfMissing(),
    );

    expect(async () => UserLanguageOHQ.get(crypto.randomUUID())).toThrow(
      Preferences.Ports.UserLanguagePreferenceMissingError,
    );
  });

  test("UserLanguageResolverSystemDefaultFallback", async () => {
    // @ts-expect-error
    spyOn(UserLanguageQueryAdapter, "get").mockResolvedValue(null);

    const UserLanguageOHQ = new Preferences.OHQ.UserLanguageAdapter(
      UserLanguageQueryAdapter,
      new Preferences.VO.SupportedLanguagesSet(SUPPORTED_LANGUAGES),
      new Preferences.Ports.UserLanguageResolverSystemDefaultFallback(SupportedLanguages.en),
    );

    const result = await UserLanguageOHQ.get(crypto.randomUUID());
    expect(result).toEqual(SupportedLanguages.en);
  });
});
