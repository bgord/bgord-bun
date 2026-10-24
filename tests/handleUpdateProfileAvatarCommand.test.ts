import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as v from "valibot";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { CommitSha } from "../src/commit-sha.vo";
import type { CommitShaValueType } from "../src/commit-sha-value.vo";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { EventStoreCollectingAdapter } from "../src/event-store-collecting.adapter";
import { IdProviderDeterministicAdapter } from "../src/id-provider-deterministic.adapter";
import { ImageInfoNoopAdapter } from "../src/image-info-noop.adapter";
import { ImageProcessorNoopAdapter } from "../src/image-processor-noop.adapter";
import * as Preferences from "../src/modules/preferences";
import { RemoteFileStorageNoopAdapter } from "../src/remote-file-storage-noop.adapter";
import { StaticConfigAdapter } from "../src/static-config.adapter";
import { TemporaryFileNoopAdapter } from "../src/temporary-file-noop.adapter";
import * as mocks from "./mocks";

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const CommitConfig = new StaticConfigAdapter<CommitShaValueType>(CommitSha.fromString("a".repeat(40)).value);
const ImageInfo = new ImageInfoNoopAdapter(tools.Mimes.png.mime);
const ImageProcessor = new ImageProcessorNoopAdapter();
const TemporaryFile = new TemporaryFileNoopAdapter(mocks.temporaryDirectory);
const RemoteFileStorage = new RemoteFileStorageNoopAdapter({ root: mocks.temporaryDirectory }, { Clock });
const deps = {
  Clock,
  CommitConfig,
  ImageInfo,
  ImageProcessor,
  TemporaryFile,
  RemoteFileStorage,
};

describe("handleUpdateProfileAvatarCommand", () => {
  test("happy path", async () => {
    using imageProcessorProcess = spyOn(ImageProcessor, "process");
    using remoteFileStoragePutFromPath = spyOn(RemoteFileStorage, "putFromPath");
    using temporaryFileCleanup = spyOn(TemporaryFile, "cleanup");
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));
    const EventStore = new EventStoreCollectingAdapter<Preferences.Events.ProfileAvatarUpdatedEventType>();
    const handler = Preferences.CommandHandlers.handleUpdateProfileAvatarCommand(mocks.ProfileAvatar, {
      ...deps,
      IdProvider,
      EventStore,
    });

    await CorrelationStorage.run(mocks.correlationId, async () =>
      handler(mocks.GenericUpdateProfileAvatarCommand),
    );

    expect(EventStore.saved).toEqual([mocks.GenericProfileAvatarUpdatedEvent]);
    expect(imageProcessorProcess).toHaveBeenCalledWith({
      strategy: "in_place",
      input: tools.FilePathAbsolute.fromString(`/tmp/profile-avatars/${mocks.userId}.png`),
      to: v.parse(tools.Extension, "webp"),
      maxSide: v.parse(tools.ImageWidth, 256),
    });
    expect(remoteFileStoragePutFromPath).toHaveBeenCalledWith({
      key: mocks.profileAvatarObjectKey,
      path: tools.FilePathAbsolute.fromString(`/tmp/profile-avatars/${mocks.userId}.webp`),
    });
    expect(temporaryFileCleanup.mock.calls[0]?.[0].get()).toEqual(`${mocks.userId}.webp`);
  });

  test("ProfileAvatarConstraints", async () => {
    using temporaryFileCleanup = spyOn(TemporaryFile, "cleanup");
    using remoteFileStoragePutFromPath = spyOn(RemoteFileStorage, "putFromPath");
    using _ = spyOn(ImageInfo, "inspect").mockResolvedValue({
      width: v.parse(tools.ImageWidth, 100),
      height: v.parse(tools.ImageHeight, 100),
      mime: tools.Mimes.text.mime,
      size: tools.Size.fromKb(100),
    });
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));
    const EventStore = new EventStoreCollectingAdapter<Preferences.Events.ProfileAvatarUpdatedEventType>();
    const handler = Preferences.CommandHandlers.handleUpdateProfileAvatarCommand(mocks.ProfileAvatar, {
      ...deps,
      IdProvider,
      EventStore,
    });

    expect(async () => handler(mocks.GenericUpdateProfileAvatarCommand)).toThrow(
      Preferences.Invariants.ProfileAvatarConstraints.error,
    );

    expect(EventStore.saved).toEqual([]);
    expect(remoteFileStoragePutFromPath).not.toHaveBeenCalled();
    expect(temporaryFileCleanup.mock.calls[0]?.[0].get()).toEqual(`${mocks.userId}.png`);
  });
});
