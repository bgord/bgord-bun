import { describe, expect, spyOn, test } from "bun:test";
import type * as tools from "@bgord/tools";
import { IdProviderCryptoAdapter } from "../src/id-provider-crypto.adapter";
import { Languages } from "../src/languages.vo";
import * as Preferences from "../src/modules/preferences";

const SupportedLanguages = ["en", "pl"] as const;
const languages = new Languages(SupportedLanguages, "en");

const userId = new IdProviderCryptoAdapter().generate();

class UserLanguageQueryAdapterNoop implements Preferences.Ports.UserLanguageQueryPort {
  async get(_userId: tools.LanguageType): Promise<tools.LanguageType | null> {
    return languages.supported.en;
  }
}

const UserLanguageQueryAdapter = new UserLanguageQueryAdapterNoop();

describe("UserLanguageOHQ", () => {
  test("happy path", async () => {
    using _ = spyOn(UserLanguageQueryAdapter, "get").mockResolvedValue(languages.supported.pl);
    const UserLanguageOHQ = new Preferences.OHQ.UserLanguageAdapter(
      languages,
      UserLanguageQueryAdapter,
      new Preferences.Ports.UserLanguageResolverThrowIfMissing(),
    );

    expect(await UserLanguageOHQ.get(userId)).toEqual(languages.supported.pl);
  });

  test("UserLanguageResolverThrowIfMissing", async () => {
    using _ = spyOn(UserLanguageQueryAdapter, "get").mockResolvedValue(null);
    const UserLanguageOHQ = new Preferences.OHQ.UserLanguageAdapter(
      languages,
      UserLanguageQueryAdapter,
      new Preferences.Ports.UserLanguageResolverThrowIfMissing(),
    );

    expect(async () => UserLanguageOHQ.get(userId)).toThrow("user.language.preference.missing");
  });

  test("UserLanguageResolverSystemDefaultFallback", async () => {
    using _ = spyOn(UserLanguageQueryAdapter, "get").mockResolvedValue(null);
    const UserLanguageOHQ = new Preferences.OHQ.UserLanguageAdapter(
      languages,
      UserLanguageQueryAdapter,
      new Preferences.Ports.UserLanguageResolverSystemDefaultFallback(languages),
    );

    expect(await UserLanguageOHQ.get(userId)).toEqual(languages.supported.en);
  });
});
