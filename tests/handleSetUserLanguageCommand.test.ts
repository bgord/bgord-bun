import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as v from "valibot";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { EventStoreCollectingAdapter } from "../src/event-store-collecting.adapter";
import { IdProviderDeterministicAdapter } from "../src/id-provider-deterministic.adapter";
import * as Preferences from "../src/modules/preferences";
import * as mocks from "./mocks";

const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));
const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const deps = { Clock, IdProvider };

class UserLanguageQueryNoopAdapter implements Preferences.Ports.UserLanguageQueryPort {
  async get(): Promise<tools.LanguageType | null> {
    return null;
  }
}

const UserLanguageQuery = new UserLanguageQueryNoopAdapter();

describe("handleSetUserLanguageCommand", async () => {
  test("happy path", async () => {
    using _ = spyOn(UserLanguageQuery, "get").mockResolvedValue(null);
    const EventStore = new EventStoreCollectingAdapter<Preferences.Events.UserLanguageSetEventType>();
    const handler = Preferences.CommandHandlers.handleSetUserLanguageCommand(mocks.languages, {
      ...deps,
      UserLanguageQuery,
      EventStore,
    });

    const command = v.parse(Preferences.Commands.SetUserLanguageCommand, {
      name: "SET_USER_LANGUAGE_COMMAND",
      correlationId: mocks.correlationId,
      id: mocks.correlationId,
      createdAt: mocks.TIME_ZERO.ms,
      payload: { userId: mocks.userId, language: mocks.languages.supported.pl },
    } satisfies Preferences.Commands.SetUserLanguageCommandType);

    await CorrelationStorage.run(mocks.correlationId, async () => {
      await handler(command);
      expect(EventStore.saved).toEqual([mocks.GenericUserLanguageSetEvent]);
    });
  });

  test("UserLanguageHasChanged", async () => {
    using _ = spyOn(UserLanguageQuery, "get").mockResolvedValue(mocks.languages.supported.pl);
    const EventStore = new EventStoreCollectingAdapter<Preferences.Events.UserLanguageSetEventType>();
    const handler = Preferences.CommandHandlers.handleSetUserLanguageCommand(mocks.languages, {
      ...deps,
      UserLanguageQuery,
      EventStore,
    });

    const command = v.parse(Preferences.Commands.SetUserLanguageCommand, {
      name: "SET_USER_LANGUAGE_COMMAND",
      correlationId: mocks.correlationId,
      id: mocks.correlationId,
      createdAt: mocks.TIME_ZERO.ms,
      payload: { userId: mocks.userId, language: mocks.languages.supported.pl },
    } satisfies Preferences.Commands.SetUserLanguageCommandType);

    await CorrelationStorage.run(mocks.correlationId, async () => {
      await handler(command);
      expect(EventStore.saved).toEqual([]);
    });
  });

  test("unsupported", async () => {
    using _ = spyOn(UserLanguageQuery, "get").mockResolvedValue(mocks.languages.supported.pl);
    const EventStore = new EventStoreCollectingAdapter<Preferences.Events.UserLanguageSetEventType>();
    const handler = Preferences.CommandHandlers.handleSetUserLanguageCommand(mocks.languages, {
      ...deps,
      UserLanguageQuery,
      EventStore,
    });

    const command = v.parse(Preferences.Commands.SetUserLanguageCommand, {
      name: "SET_USER_LANGUAGE_COMMAND",
      correlationId: mocks.correlationId,
      id: mocks.correlationId,
      createdAt: mocks.TIME_ZERO.ms,
      payload: { userId: mocks.userId, language: "es" },
    } satisfies Preferences.Commands.SetUserLanguageCommandType);

    await CorrelationStorage.run(mocks.correlationId, async () => {
      expect(async () => handler(command)).toThrow("handle.set.user.language.command.error.missing");
      expect(EventStore.saved).toEqual([]);
    });
  });
});
