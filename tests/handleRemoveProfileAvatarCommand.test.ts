import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { CommitSha } from "../src/commit-sha.vo";
import type { CommitShaValueType } from "../src/commit-sha-value.vo";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { EventStoreCollectingAdapter } from "../src/event-store-collecting.adapter";
import { IdProviderDeterministicAdapter } from "../src/id-provider-deterministic.adapter";
import * as Preferences from "../src/modules/preferences";
import { RemoteFileStorageNoopAdapter } from "../src/remote-file-storage-noop.adapter";
import { StaticConfigAdapter } from "../src/static-config.adapter";
import * as mocks from "./mocks";

const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));
const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const CommitConfig = new StaticConfigAdapter<CommitShaValueType>(CommitSha.fromString("a".repeat(40)).value);
const RemoteFileStorage = new RemoteFileStorageNoopAdapter({ root: mocks.temporaryDirectory }, { Clock });

describe("handleRemoveProfileAvatarCommand", () => {
  test("happy path", async () => {
    using remoteFileStorageDelete = spyOn(RemoteFileStorage, "delete");
    const EventStore = new EventStoreCollectingAdapter<Preferences.Events.ProfileAvatarRemovedEventType>();
    const handler = Preferences.CommandHandlers.handleRemoveProfileAvatarCommand(mocks.ProfileAvatar, {
      IdProvider,
      Clock,
      CommitConfig,
      RemoteFileStorage,
      EventStore,
    });

    await CorrelationStorage.run(mocks.correlationId, async () =>
      handler(mocks.GenericRemoveProfileAvatarCommand),
    );

    expect(EventStore.saved).toEqual([mocks.GenericProfileAvatarRemovedEvent]);
    expect(remoteFileStorageDelete).toHaveBeenCalledWith(mocks.profileAvatarObjectKey);
  });
});
