import { describe, expect, spyOn, test } from "bun:test";
import type * as tools from "@bgord/tools";
import { IdProviderCryptoAdapter } from "../src/id-provider-crypto.adapter";
import * as Preferences from "../src/modules/preferences";

const userId = new IdProviderCryptoAdapter().generate();
export enum SupportedLanguages {
  en = "en",
  pl = "pl",
}
export const SUPPORTED_LANGUAGES = [SupportedLanguages.en, SupportedLanguages.pl];

class UserLanguageQueryAdapterNoop implements Preferences.Ports.UserLanguageQueryPort {
  async get(_userId: tools.LanguageType): Promise<tools.LanguageType | null> {
    return SupportedLanguages.en;
  }
}

const UserLanguageQueryAdapter = new UserLanguageQueryAdapterNoop();

describe("preferences - ohq - UserLanguageOHQ", () => {
  test("happy path", async () => {
    spyOn(UserLanguageQueryAdapter, "get").mockResolvedValue(SupportedLanguages.pl);
    const UserLanguageOHQ = new Preferences.OHQ.UserLanguageAdapter(
      UserLanguageQueryAdapter,
      new Preferences.VO.SupportedLanguagesSet(SUPPORTED_LANGUAGES),
      new Preferences.Ports.UserLanguageResolverThrowIfMissing(),
    );

    expect(await UserLanguageOHQ.get(userId)).toEqual(SupportedLanguages.pl);
  });

  test("UserLanguageResolverThrowIfMissing", async () => {
    spyOn(UserLanguageQueryAdapter, "get").mockResolvedValue(null);
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
    spyOn(UserLanguageQueryAdapter, "get").mockResolvedValue(null);
    const UserLanguageOHQ = new Preferences.OHQ.UserLanguageAdapter(
      UserLanguageQueryAdapter,
      new Preferences.VO.SupportedLanguagesSet(SUPPORTED_LANGUAGES),
      new Preferences.Ports.UserLanguageResolverSystemDefaultFallback(SupportedLanguages.en),
    );

    expect(await UserLanguageOHQ.get(userId)).toEqual(SupportedLanguages.en);
  });
});
