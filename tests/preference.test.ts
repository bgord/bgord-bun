import { describe, expect, spyOn, test } from "bun:test";
import * as Preferences from "../src/modules/preferences";
import * as mocks from "./mocks";

describe("PreferenceAdapter", () => {
  test("stored", async () => {
    using preferenceReaderGet = spyOn(mocks.PreferenceReader, "get").mockResolvedValue("off");
    const adapter = new Preferences.OHQ.PreferenceAdapter(mocks.NotificationPreference, mocks.PreferenceReader);

    const result = await adapter.get(mocks.userId);

    expect(result).toEqual("off");
    expect(preferenceReaderGet).toHaveBeenCalledWith(mocks.userId, "notification");
  });

  test("default", async () => {
    const adapter = new Preferences.OHQ.PreferenceAdapter(mocks.NotificationPreference, mocks.PreferenceReader);

    const result = await adapter.get(mocks.userId);

    expect(result).toEqual("on");
  });

  test("default - null", async () => {
    const adapter = new Preferences.OHQ.PreferenceAdapter(mocks.EmailPreference, mocks.PreferenceReader);

    const result = await adapter.get(mocks.userId);

    expect(result).toEqual(null);
  });

  test("invalid stored value", async () => {
    using _ = spyOn(mocks.PreferenceReader, "get").mockResolvedValue("maybe");
    const adapter = new Preferences.OHQ.PreferenceAdapter(mocks.NotificationPreference, mocks.PreferenceReader);

    expect(async () => adapter.get(mocks.userId)).toThrow("notification.invalid");
  });
});
