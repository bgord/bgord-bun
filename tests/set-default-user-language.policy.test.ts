import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { EventHandlerBareStrategy } from "../src/handler-bare.strategy";
import { IdProviderDeterministicAdapter } from "../src/id-provider-deterministic.adapter";
import {
  CommandBusCollectingAdapter,
  EventBusCollectingAdapter,
} from "../src/message-bus-collecting.adapter";
import type * as Auth from "../src/modules/auth";
import * as Preferences from "../src/modules/preferences";
import * as mocks from "./mocks";

const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));
const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const EventBus = new EventBusCollectingAdapter<Auth.Events.AccountCreatedEventType>();
const EventHandler = new EventHandlerBareStrategy();
const deps = { IdProvider, Clock, EventBus, EventHandler };

describe("SetDefaultUserLanguage", () => {
  test("happy path", async () => {
    const CommandBus = new CommandBusCollectingAdapter<Preferences.Commands.SetUserLanguageCommandType>();
    const policy = new Preferences.Policies.SetDefaultUserLanguage(mocks.languages.supported.pl, {
      ...deps,
      CommandBus,
    });

    await CorrelationStorage.run(mocks.correlationId, async () =>
      policy.onAccountCreatedEvent(mocks.GenericAccountCreatedEvent),
    );

    expect(CommandBus.messages).toEqual([mocks.GenericSetUserLanguageCommand]);
  });
});
