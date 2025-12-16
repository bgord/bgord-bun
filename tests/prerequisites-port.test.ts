import { describe, expect, test } from "bun:test";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { Port } from "../src/port.vo";
import { PrerequisitePort } from "../src/prerequisites/port";
import * as mocks from "./mocks";

const port = Port.parse(43210);

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);

describe("PrerequisitePort", () => {
  test("success", async () => {
    expect(await new PrerequisitePort({ port, label: "port" }).verify(Clock)).toEqual(
      mocks.VerificationSuccess,
    );
  });

  test("failure", async () => {
    const occupied = Bun.listen({ hostname: "::", port, socket: { data() {} } });

    expect(await new PrerequisitePort({ port, label: "port" }).verify(Clock)).toEqual(
      mocks.VerificationFailure(),
    );

    occupied.stop();
  });

  test("undetermined", async () => {
    expect(await new PrerequisitePort({ port, label: "port", enabled: false }).verify(Clock)).toEqual(
      mocks.VerificationUndetermined,
    );
  });
});
