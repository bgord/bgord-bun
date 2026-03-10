import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { IdProviderDeterministicAdapter } from "../src/id-provider-deterministic.adapter";
import * as Preferences from "../src/modules/preferences";
import * as mocks from "./mocks";

const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));
const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const deps = { Clock, IdProvider };

const EventStore = { save: async () => {} };

class UserLanguageQueryNoopAdapter implements Preferences.Ports.UserLanguageQueryPort {
  async get(): Promise<tools.LanguageType | null> {
    return null;
  }
}

const UserLanguageQuery = new UserLanguageQueryNoopAdapter();

const handler = Preferences.CommandHandlers.handleSetUserLanguageCommand(mocks.languages, {
  ...deps,
  UserLanguageQuery,
  EventStore,
});

describe("handleSetUserLanguageCommand", async () => {
  test("happy path", async () => {
    using eventStoreSave = spyOn(EventStore, "save");
    using _ = spyOn(UserLanguageQuery, "get").mockResolvedValue(null);

    const command = Preferences.Commands.SetUserLanguageCommand.parse({
      name: "SET_USER_LANGUAGE_COMMAND",
      correlationId: mocks.correlationId,
      id: mocks.correlationId,
      createdAt: mocks.TIME_ZERO.ms,
      payload: { userId: mocks.userId, language: mocks.languages.supported.pl },
    } satisfies Preferences.Commands.SetUserLanguageCommandType);

    await CorrelationStorage.run(mocks.correlationId, async () => {
      await handler(command);
      expect(eventStoreSave).toHaveBeenCalledWith([mocks.GenericUserLanguageSetEvent]);
    });
  });

  test("UserLanguageHasChanged", async () => {
    using eventStoreSave = spyOn(EventStore, "save");
    using _ = spyOn(UserLanguageQuery, "get").mockResolvedValue(mocks.languages.supported.pl);

    const command = Preferences.Commands.SetUserLanguageCommand.parse({
      name: "SET_USER_LANGUAGE_COMMAND",
      correlationId: mocks.correlationId,
      id: mocks.correlationId,
      createdAt: mocks.TIME_ZERO.ms,
      payload: { userId: mocks.userId, language: mocks.languages.supported.pl },
    } satisfies Preferences.Commands.SetUserLanguageCommandType);

    await CorrelationStorage.run(mocks.correlationId, async () => {
      await handler(command);
      expect(eventStoreSave).not.toHaveBeenCalled();
    });
  });

  test("unsupported", async () => {
    using eventStoreSave = spyOn(EventStore, "save");
    using _ = spyOn(UserLanguageQuery, "get").mockResolvedValue(mocks.languages.supported.pl);

    const command = Preferences.Commands.SetUserLanguageCommand.parse({
      name: "SET_USER_LANGUAGE_COMMAND",
      correlationId: mocks.correlationId,
      id: mocks.correlationId,
      createdAt: mocks.TIME_ZERO.ms,
      payload: { userId: mocks.userId, language: "es" },
    } satisfies Preferences.Commands.SetUserLanguageCommandType);

    await CorrelationStorage.run(mocks.correlationId, async () => {
      expect(async () => handler(command)).toThrow("handle.set.user.language.command.error.missing");
      expect(eventStoreSave).not.toHaveBeenCalled();
    });
  });
});
