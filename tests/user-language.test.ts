import { describe, expect, spyOn, test } from "bun:test";
import type * as tools from "@bgord/tools";
import * as Preferences from "../src/modules/preferences";
import * as mocks from "./mocks";

class UserLanguageQueryAdapterNoop implements Preferences.Ports.UserLanguageQueryPort {
  async get(_userId: tools.LanguageType): Promise<tools.LanguageType | null> {
    return mocks.languages.supported.en;
  }
}

const UserLanguageQueryAdapter = new UserLanguageQueryAdapterNoop();

describe("UserLanguageOHQ", () => {
  test("happy path", async () => {
    using _ = spyOn(UserLanguageQueryAdapter, "get").mockResolvedValue(mocks.languages.supported.pl);
    const UserLanguageOHQ = new Preferences.OHQ.UserLanguageAdapter(
      mocks.languages,
      UserLanguageQueryAdapter,
      new Preferences.Ports.UserLanguageResolverThrowIfMissing(),
    );

    expect(await UserLanguageOHQ.get(mocks.userId)).toEqual(mocks.languages.supported.pl);
  });

  test("UserLanguageResolverThrowIfMissing", async () => {
    using _ = spyOn(UserLanguageQueryAdapter, "get").mockResolvedValue(null);
    const UserLanguageOHQ = new Preferences.OHQ.UserLanguageAdapter(
      mocks.languages,
      UserLanguageQueryAdapter,
      new Preferences.Ports.UserLanguageResolverThrowIfMissing(),
    );

    expect(async () => UserLanguageOHQ.get(mocks.userId)).toThrow("user.language.preference.missing");
  });

  test("UserLanguageResolverSystemDefaultFallback", async () => {
    using _ = spyOn(UserLanguageQueryAdapter, "get").mockResolvedValue(null);
    const UserLanguageOHQ = new Preferences.OHQ.UserLanguageAdapter(
      mocks.languages,
      UserLanguageQueryAdapter,
      new Preferences.Ports.UserLanguageResolverSystemDefaultFallback(mocks.languages),
    );

    expect(await UserLanguageOHQ.get(mocks.userId)).toEqual(mocks.languages.supported.en);
  });

  test("unsupported", async () => {
    using _ = spyOn(UserLanguageQueryAdapter, "get").mockResolvedValue("es");
    const UserLanguageOHQ = new Preferences.OHQ.UserLanguageAdapter(
      mocks.languages,
      UserLanguageQueryAdapter,
      new Preferences.Ports.UserLanguageResolverSystemDefaultFallback(mocks.languages),
    );

    expect(async () => UserLanguageOHQ.get(mocks.userId)).toThrow("user.language.ohq.error.missing");
  });
});
