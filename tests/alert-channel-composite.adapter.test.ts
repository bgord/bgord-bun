import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { AlertChannelCollectingAdapter } from "../src/alert-channel-collecting.adapter";
import { AlertChannelCompositeAdapter } from "../src/alert-channel-composite.adapter";
import { AlertChannelNoopAdapter } from "../src/alert-channel-noop.adapter";
import * as mocks from "./mocks";

const noop = new AlertChannelNoopAdapter();

describe("AlertChannelCompositeAdapter", () => {
  test("min channels", () => {
    expect(() => new AlertChannelCompositeAdapter([])).toThrow("alert.channel.composite.channels.min");
  });

  test("max channels", () => {
    expect(() => new AlertChannelCompositeAdapter(tools.repeat(noop, 6))).toThrow(
      "alert.channel.composite.channels.max",
    );
  });

  test("enough channels", () => {
    expect(() => new AlertChannelCompositeAdapter(tools.repeat(noop, 5))).not.toThrow();
  });

  test("send", async () => {
    const first = new AlertChannelCollectingAdapter();
    const second = new AlertChannelCollectingAdapter();

    await new AlertChannelCompositeAdapter([first, second]).send(mocks.alert);

    expect(first.alerts).toEqual([mocks.alert]);
    expect(second.alerts).toEqual([mocks.alert]);
  });

  test("send - one failure", async () => {
    const passing = new AlertChannelCollectingAdapter();
    const failing = new AlertChannelCollectingAdapter();
    using _ = spyOn(failing, "send").mockImplementation(mocks.throwIntentionalErrorAsync);

    await new AlertChannelCompositeAdapter([failing, passing]).send(mocks.alert);

    expect(passing.alerts).toEqual([mocks.alert]);
  });

  test("send - all failures", async () => {
    const failing = new AlertChannelCollectingAdapter();
    using _ = spyOn(failing, "send").mockImplementation(mocks.throwIntentionalErrorAsync);

    await new AlertChannelCompositeAdapter([failing, failing]).send(mocks.alert);
  });

  test("verify", async () => {
    expect(await new AlertChannelCompositeAdapter([noop, noop]).verify()).toEqual(true);
  });

  test("verify - false", async () => {
    const failing = new AlertChannelNoopAdapter();
    using _ = spyOn(failing, "verify").mockResolvedValue(false);

    expect(await new AlertChannelCompositeAdapter([noop, failing]).verify()).toEqual(false);
  });
});
