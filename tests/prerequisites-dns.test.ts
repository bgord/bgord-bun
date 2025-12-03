import { describe, expect, spyOn, test } from "bun:test";
import dns from "dns/promises";
import * as tools from "@bgord/tools";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { PrerequisiteDNS } from "../src/prerequisites/dns";
import { PrerequisiteStatusEnum } from "../src/prerequisites.service";
import * as mocks from "./mocks";

const clock = new ClockFixedAdapter(mocks.TIME_ZERO);

const hostname = "api.example.com";
const result = { address: hostname, family: 4 };

describe("PrerequisiteExternalApi", () => {
  test("success", async () => {
    spyOn(dns, "lookup").mockResolvedValue(result);

    expect(await new PrerequisiteDNS({ label: "dns", hostname }).verify(clock)).toEqual(
      mocks.VerificationSuccess,
    );
  });

  test("failure", async () => {
    spyOn(dns, "lookup").mockRejectedValue(mocks.IntentialError);

    expect(await new PrerequisiteDNS({ label: "dns", hostname }).verify(clock)).toEqual(
      mocks.VerificationFailure(mocks.IntentialError),
    );
  });

  test("undetermined", async () => {
    expect(await new PrerequisiteDNS({ label: "dns", hostname, enabled: false }).verify(clock)).toEqual(
      mocks.VerificationUndetermined,
    );
  });

  test("timeout", async () => {
    // @ts-expect-error
    spyOn(dns, "lookup").mockImplementation(() => Bun.sleep(tools.Duration.Ms(6).ms));

    expect(
      (await new PrerequisiteDNS({ label: "dns", hostname, timeout: tools.Duration.Ms(5) }).verify(clock))
        .status,
    ).toEqual(PrerequisiteStatusEnum.failure);
  });
});
