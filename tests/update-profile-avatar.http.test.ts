import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { IdProviderDeterministicAdapter } from "../src/id-provider-deterministic.adapter";
import { CommandBusCollectingAdapter } from "../src/message-bus-collecting.adapter";
import * as Preferences from "../src/modules/preferences";
import { TemporaryFileNoopAdapter } from "../src/temporary-file-noop.adapter";
import * as mocks from "./mocks";
import { RequestContextBuilder } from "./request-context-builder";

const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));
const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const TemporaryFile = new TemporaryFileNoopAdapter(mocks.temporaryDirectory);

describe("Preferences.HTTP.UpdateProfileAvatar", () => {
  test("validation - unauthenticated", async () => {
    const CommandBus = new CommandBusCollectingAdapter<Preferences.Commands.UpdateProfileAvatarCommandType>();
    const endpoint = Preferences.HTTP.UpdateProfileAvatar({ IdProvider, Clock, CommandBus, TemporaryFile });
    const form = new FormData();
    form.append("file", mocks.png);
    const context = new RequestContextBuilder().withForm(form).build();

    expect(async () => endpoint(context)).toThrow("shield.auth.rejected");
  });

  test("validation - file - extension", async () => {
    const CommandBus = new CommandBusCollectingAdapter<Preferences.Commands.UpdateProfileAvatarCommandType>();
    const endpoint = Preferences.HTTP.UpdateProfileAvatar({ IdProvider, Clock, CommandBus, TemporaryFile });
    const form = new FormData();
    form.append("file", new File([new Uint8Array([1])], "avatar"));
    const context = new RequestContextBuilder().withUserId(mocks.userId).withForm(form).build();

    expect(async () => endpoint(context)).toThrow("filename.from.string.invalid");
  });

  test("validation - file - extension - trailing dot", async () => {
    const CommandBus = new CommandBusCollectingAdapter<Preferences.Commands.UpdateProfileAvatarCommandType>();
    const endpoint = Preferences.HTTP.UpdateProfileAvatar({ IdProvider, Clock, CommandBus, TemporaryFile });
    const form = new FormData();
    form.append("file", new File([new Uint8Array([1])], "avatar."));
    const context = new RequestContextBuilder().withUserId(mocks.userId).withForm(form).build();

    expect(async () => endpoint(context)).toThrow("filename.from.string.invalid");
  });

  test("happy path", async () => {
    using temporaryFileWrite = spyOn(TemporaryFile, "write");
    const CommandBus = new CommandBusCollectingAdapter<Preferences.Commands.UpdateProfileAvatarCommandType>();
    const endpoint = Preferences.HTTP.UpdateProfileAvatar({ IdProvider, Clock, CommandBus, TemporaryFile });
    const form = new FormData();
    form.append("file", mocks.png);
    const context = new RequestContextBuilder().withUserId(mocks.userId).withForm(form).build();

    const response = await CorrelationStorage.run(mocks.correlationId, async () => endpoint(context));

    expect(response.status).toEqual(200);
    expect(CommandBus.messages).toEqual([mocks.GenericUpdateProfileAvatarCommand]);
    expect(temporaryFileWrite.mock.calls[0]?.[0].get()).toEqual(`${mocks.userId}.png`);
  });
});
