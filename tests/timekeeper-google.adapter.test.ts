import { describe, expect, spyOn, test } from "bun:test";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { TimekeeperGoogleAdapter } from "../src/timekeeper-google.adapter";
import * as mocks from "./mocks";

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);

describe("TimekeeperGoogleAdapter", () => {
  test("happy path", async () => {
    spyOn(global, "fetch").mockResolvedValue(
      new Response(null, { headers: { date: mocks.TIME_ZERO_DATE_UTC } }),
    );

    expect(await new TimekeeperGoogleAdapter().get()).toEqual(Clock.now());
  });

  test("missing date header", async () => {
    spyOn(global, "fetch").mockResolvedValue(new Response(null));

    expect(await new TimekeeperGoogleAdapter().get()).toEqual(null);
  });

  test("invalid date header", async () => {
    spyOn(global, "fetch").mockResolvedValue(new Response(null, { headers: { date: "xxx" } }));

    expect(await new TimekeeperGoogleAdapter().get()).toEqual(null);
  });

  test("error", async () => {
    spyOn(global, "fetch").mockRejectedValue(new Error(mocks.IntentionalError));

    expect(await new TimekeeperGoogleAdapter().get()).toEqual(null);
  });
});
