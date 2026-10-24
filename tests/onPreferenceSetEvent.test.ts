import { describe, expect, spyOn, test } from "bun:test";
import * as Preferences from "../src/modules/preferences";
import * as mocks from "./mocks";

const definitions = [mocks.NotificationPreference, mocks.EmailPreference];

describe("onPreferenceSetEvent", () => {
  test("happy path", async () => {
    using preferenceWriterSet = spyOn(mocks.PreferenceWriter, "set");
    const handler = Preferences.EventHandlers.onPreferenceSetEvent(definitions, mocks.PreferenceWriter);

    await handler(mocks.GenericPreferenceSetEvent);

    expect(preferenceWriterSet).toHaveBeenCalledWith({
      userId: mocks.userId,
      key: "notification",
      value: "off",
      at: mocks.TIME_ZERO.ms,
    });
  });

  test("unknown preference", async () => {
    using preferenceWriterSet = spyOn(mocks.PreferenceWriter, "set");
    const handler = Preferences.EventHandlers.onPreferenceSetEvent(definitions, mocks.PreferenceWriter);

    expect(async () =>
      handler({
        ...mocks.GenericPreferenceSetEvent,
        payload: { ...mocks.GenericPreferenceSetEvent.payload, preference: "unknown" },
      }),
    ).toThrow("on.preference.set.event.error.unknown");
    expect(preferenceWriterSet).not.toHaveBeenCalled();
  });
});
