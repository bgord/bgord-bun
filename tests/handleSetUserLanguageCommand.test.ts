import { describe, expect, spyOn, test } from "bun:test";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { IdProviderDeterministicAdapter } from "../src/id-provider-deterministic.adapter";
import * as Preferences from "../src/modules/preferences";
import * as mocks from "./mocks";

export enum SupportedLanguages {
  en = "en",
  pl = "pl",
}

export const SUPPORTED_LANGUAGES = [SupportedLanguages.en, SupportedLanguages.pl] as const;

const supportedLanguagesSet = new Preferences.VO.SupportedLanguagesSet(SUPPORTED_LANGUAGES);

const IdProvider = new IdProviderDeterministicAdapter([mocks.correlationId]);
const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const deps = { Clock, IdProvider };

describe("handleSetUserLanguageCommand", async () => {
  test("happy path", async () => {
    const EventStore = { save: async () => {} };
    const eventStoreSave = spyOn(EventStore, "save");

    class UserLanguageQuery implements Preferences.Ports.UserLanguageQueryPort {
      async get() {
        return null;
      }
    }

    const handler = Preferences.CommandHandlers.handleSetUserLanguageCommand(supportedLanguagesSet, {
      ...deps,
      UserLanguageQuery: new UserLanguageQuery(),
      EventStore,
    });

    const command = Preferences.Commands.SetUserLanguageCommand.parse({
      name: "SET_USER_LANGUAGE_COMMAND",
      correlationId: mocks.correlationId,
      id: mocks.correlationId,
      createdAt: mocks.TIME_ZERO.ms,
      payload: { userId: mocks.correlationId, language: SupportedLanguages.pl },
    } satisfies Preferences.Commands.SetUserLanguageCommandType);

    await CorrelationStorage.run(mocks.correlationId, async () => {
      await handler(command);

      expect(eventStoreSave).toHaveBeenCalledWith([
        {
          name: "USER_LANGUAGE_SET_EVENT",
          correlationId: mocks.correlationId,
          id: mocks.correlationId,
          createdAt: mocks.TIME_ZERO.ms,
          payload: { userId: mocks.correlationId, language: SupportedLanguages.pl },
          stream: `preferences_${mocks.correlationId}`,
          version: 1,
        },
      ]);
    });
  });

  test("UserLanguageHasChanged", async () => {
    const EventStore = { save: async () => {} };
    const eventStoreSave = spyOn(EventStore, "save");

    class UserLanguageQuery implements Preferences.Ports.UserLanguageQueryPort {
      async get() {
        return SupportedLanguages.pl;
      }
    }

    const handler = Preferences.CommandHandlers.handleSetUserLanguageCommand(supportedLanguagesSet, {
      ...deps,
      UserLanguageQuery: new UserLanguageQuery(),
      EventStore,
    });

    const command = Preferences.Commands.SetUserLanguageCommand.parse({
      name: "SET_USER_LANGUAGE_COMMAND",
      correlationId: mocks.correlationId,
      id: mocks.correlationId,
      createdAt: mocks.TIME_ZERO.ms,
      payload: { userId: mocks.correlationId, language: SupportedLanguages.pl },
    } satisfies Preferences.Commands.SetUserLanguageCommandType);

    await CorrelationStorage.run(mocks.correlationId, async () => {
      await handler(command);

      expect(eventStoreSave).not.toHaveBeenCalled();
    });
  });
});
