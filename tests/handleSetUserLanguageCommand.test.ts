import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { IdProviderDeterministicAdapter } from "../src/id-provider-deterministic.adapter";
import { Languages } from "../src/languages.vo";
import * as Preferences from "../src/modules/preferences";
import * as mocks from "./mocks";

const SupportedLanguages = ["en", "pl"] as const;
const languages = new Languages(SupportedLanguages, "en");

const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));
const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const deps = { Clock, IdProvider };

describe("handleSetUserLanguageCommand", async () => {
  test("happy path", async () => {
    const EventStore = { save: async () => {} };
    using eventStoreSave = spyOn(EventStore, "save");

    class UserLanguageQuery implements Preferences.Ports.UserLanguageQueryPort {
      async get() {
        return null;
      }
    }

    const handler = Preferences.CommandHandlers.handleSetUserLanguageCommand(languages, {
      ...deps,
      UserLanguageQuery: new UserLanguageQuery(),
      EventStore,
    });

    const command = Preferences.Commands.SetUserLanguageCommand.parse({
      name: "SET_USER_LANGUAGE_COMMAND",
      correlationId: mocks.correlationId,
      id: mocks.correlationId,
      createdAt: mocks.TIME_ZERO.ms,
      payload: { userId: mocks.correlationId, language: languages.supported.pl },
    } satisfies Preferences.Commands.SetUserLanguageCommandType);

    await CorrelationStorage.run(mocks.correlationId, async () => {
      await handler(command);

      expect(eventStoreSave).toHaveBeenCalledWith([
        {
          name: "USER_LANGUAGE_SET_EVENT",
          correlationId: mocks.correlationId,
          id: mocks.correlationId,
          createdAt: mocks.TIME_ZERO.ms,
          payload: { userId: mocks.correlationId, language: languages.supported.pl },
          stream: `preferences_${mocks.correlationId}`,
          version: 1,
        },
      ]);
    });
  });

  test("UserLanguageHasChanged", async () => {
    const EventStore = { save: async () => {} };
    using eventStoreSave = spyOn(EventStore, "save");

    class UserLanguageQuery implements Preferences.Ports.UserLanguageQueryPort {
      async get() {
        return languages.supported.pl;
      }
    }

    const handler = Preferences.CommandHandlers.handleSetUserLanguageCommand(languages, {
      ...deps,
      UserLanguageQuery: new UserLanguageQuery(),
      EventStore,
    });

    const command = Preferences.Commands.SetUserLanguageCommand.parse({
      name: "SET_USER_LANGUAGE_COMMAND",
      correlationId: mocks.correlationId,
      id: mocks.correlationId,
      createdAt: mocks.TIME_ZERO.ms,
      payload: { userId: mocks.correlationId, language: languages.supported.pl },
    } satisfies Preferences.Commands.SetUserLanguageCommandType);

    await CorrelationStorage.run(mocks.correlationId, async () => {
      await handler(command);

      expect(eventStoreSave).not.toHaveBeenCalled();
    });
  });
});
