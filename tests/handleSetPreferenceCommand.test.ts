import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { CommitSha } from "../src/commit-sha.vo";
import type { CommitShaValueType } from "../src/commit-sha-value.vo";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { EventStoreCollectingAdapter } from "../src/event-store-collecting.adapter";
import { IdProviderDeterministicAdapter } from "../src/id-provider-deterministic.adapter";
import * as Preferences from "../src/modules/preferences";
import { StaticConfigAdapter } from "../src/static-config.adapter";
import * as mocks from "./mocks";

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const CommitConfig = new StaticConfigAdapter<CommitShaValueType>(CommitSha.fromString("a".repeat(40)).value);
const definitions = [mocks.NotificationPreference, mocks.EmailPreference];

describe("handleSetPreferenceCommand", () => {
  test("happy path", async () => {
    using preferenceReaderGet = spyOn(mocks.PreferenceReader, "get");
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));
    const EventStore = new EventStoreCollectingAdapter<Preferences.Events.PreferenceSetEventType>();
    const handler = Preferences.CommandHandlers.handleSetPreferenceCommand(definitions, {
      Clock,
      CommitConfig,
      IdProvider,
      EventStore,
      PreferenceReader: mocks.PreferenceReader,
    });

    await CorrelationStorage.run(mocks.correlationId, async () => handler(mocks.GenericSetPreferenceCommand));

    expect(EventStore.saved).toEqual([mocks.GenericPreferenceSetEvent]);
    expect(preferenceReaderGet).toHaveBeenCalledWith(mocks.userId, "notification");
  });

  test("PreferenceHasChanged", async () => {
    using _ = spyOn(mocks.PreferenceReader, "get").mockResolvedValue("off");
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));
    const EventStore = new EventStoreCollectingAdapter<Preferences.Events.PreferenceSetEventType>();
    const handler = Preferences.CommandHandlers.handleSetPreferenceCommand(definitions, {
      Clock,
      CommitConfig,
      IdProvider,
      EventStore,
      PreferenceReader: mocks.PreferenceReader,
    });

    await CorrelationStorage.run(mocks.correlationId, async () => handler(mocks.GenericSetPreferenceCommand));

    expect(EventStore.saved).toEqual([]);
  });

  test("PreferenceHasChanged - default", async () => {
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));
    const EventStore = new EventStoreCollectingAdapter<Preferences.Events.PreferenceSetEventType>();
    const handler = Preferences.CommandHandlers.handleSetPreferenceCommand(definitions, {
      Clock,
      CommitConfig,
      IdProvider,
      EventStore,
      PreferenceReader: mocks.PreferenceReader,
    });

    await CorrelationStorage.run(mocks.correlationId, async () =>
      handler({
        ...mocks.GenericSetPreferenceCommand,
        payload: { ...mocks.GenericSetPreferenceCommand.payload, value: "on" },
      }),
    );

    expect(EventStore.saved).toEqual([]);
  });

  test("unknown preference", async () => {
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));
    const EventStore = new EventStoreCollectingAdapter<Preferences.Events.PreferenceSetEventType>();
    const handler = Preferences.CommandHandlers.handleSetPreferenceCommand(definitions, {
      Clock,
      CommitConfig,
      IdProvider,
      EventStore,
      PreferenceReader: mocks.PreferenceReader,
    });

    expect(async () =>
      handler({
        ...mocks.GenericSetPreferenceCommand,
        payload: { ...mocks.GenericSetPreferenceCommand.payload, preference: "unknown" },
      }),
    ).toThrow("handle.set.preference.command.error.unknown");
    expect(EventStore.saved).toEqual([]);
  });

  test("invalid value", async () => {
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));
    const EventStore = new EventStoreCollectingAdapter<Preferences.Events.PreferenceSetEventType>();
    const handler = Preferences.CommandHandlers.handleSetPreferenceCommand(definitions, {
      Clock,
      CommitConfig,
      IdProvider,
      EventStore,
      PreferenceReader: mocks.PreferenceReader,
    });

    expect(async () =>
      handler({
        ...mocks.GenericSetPreferenceCommand,
        payload: { ...mocks.GenericSetPreferenceCommand.payload, value: "maybe" },
      }),
    ).toThrow("notification.invalid");
    expect(EventStore.saved).toEqual([]);
  });
});
