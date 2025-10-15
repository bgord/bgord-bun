import { describe, expect, spyOn, test } from "bun:test";
import type * as tools from "@bgord/tools";
import { IdProviderCryptoAdapter } from "../src/id-provider-crypto.adapter";
import * as Preferences from "../src/modules/preferences";

const userId = new IdProviderCryptoAdapter().generate();

export enum SupportedLanguages {
  en = "en",
  pl = "pl",
}

export const SUPPORTED_LANGUAGES = [SupportedLanguages.en, SupportedLanguages.pl] as const;

class UserLanguageQueryAdapterNoop implements Preferences.Ports.UserLanguageQueryPort {
  async get(_userId: tools.LanguageType) {
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
    const language = await UserLanguageOHQ.get(userId);

    expect(language).toEqual(SupportedLanguages.pl);
  });

  test("UserLanguageResolverThrowIfMissing", async () => {
    spyOn(UserLanguageQueryAdapter, "get").mockResolvedValue(null as any);

    const UserLanguageOHQ = new Preferences.OHQ.UserLanguageAdapter(
      UserLanguageQueryAdapter,
      new Preferences.VO.SupportedLanguagesSet(SUPPORTED_LANGUAGES),
      new Preferences.Ports.UserLanguageResolverThrowIfMissing(),
    );

    expect(async () => UserLanguageOHQ.get(userId)).toThrow(
      Preferences.Ports.UserLanguagePreferenceError.Missing,
    );
  });

  test("UserLanguageResolverSystemDefaultFallback", async () => {
    spyOn(UserLanguageQueryAdapter, "get").mockResolvedValue(null as any);

    const UserLanguageOHQ = new Preferences.OHQ.UserLanguageAdapter(
      UserLanguageQueryAdapter,
      new Preferences.VO.SupportedLanguagesSet(SUPPORTED_LANGUAGES),
      new Preferences.Ports.UserLanguageResolverSystemDefaultFallback(SupportedLanguages.en),
    );
    const result = await UserLanguageOHQ.get(userId);

    expect(result).toEqual(SupportedLanguages.en);
  });
});
