import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { IdProviderDeterministicAdapter } from "../src/id-provider-deterministic.adapter";
import { CommandBusCollectingAdapter } from "../src/message-bus-collecting.adapter";
import * as Preferences from "../src/modules/preferences";
import * as mocks from "./mocks";
import { RequestContextBuilder } from "./request-context-builder";

const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));
const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);

describe("Preferences.HTTP.UpdatePreference", () => {
  test("validation - unauthenticated", async () => {
    const CommandBus = new CommandBusCollectingAdapter<Preferences.Commands.SetPreferenceCommandType>();
    const endpoint = Preferences.HTTP.UpdatePreference(mocks.NotificationPreference, {
      IdProvider,
      Clock,
      CommandBus,
    });
    const context = new RequestContextBuilder().withJson({ notification: "off" }).build();

    expect(async () => endpoint(context)).toThrow("shield.auth.rejected");
  });

  test("validation - invalid", async () => {
    const CommandBus = new CommandBusCollectingAdapter<Preferences.Commands.SetPreferenceCommandType>();
    const endpoint = Preferences.HTTP.UpdatePreference(mocks.NotificationPreference, {
      IdProvider,
      Clock,
      CommandBus,
    });
    const context = new RequestContextBuilder().withUserId(mocks.userId).withJson({ notification: "maybe" }).build();

    expect(async () => endpoint(context)).toThrow("notification.invalid");
  });

  test("happy path", async () => {
    const CommandBus = new CommandBusCollectingAdapter<Preferences.Commands.SetPreferenceCommandType>();
    const endpoint = Preferences.HTTP.UpdatePreference(mocks.NotificationPreference, {
      IdProvider,
      Clock,
      CommandBus,
    });
    const context = new RequestContextBuilder().withUserId(mocks.userId).withJson({ notification: "off" }).build();

    const response = await CorrelationStorage.run(mocks.correlationId, async () => endpoint(context));

    expect(response.status).toEqual(200);
    expect(CommandBus.messages).toEqual([mocks.GenericSetPreferenceCommand]);
  });
});
