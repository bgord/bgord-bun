import { describe, expect, jest, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as v from "valibot";
import { AntivirusNoopAdapter } from "../src/antivirus-noop.adapter";
import { AntivirusWithTimeoutAdapter } from "../src/antivirus-with-timeout.adapter";
import { TimeoutRunnerBareAdapter } from "../src/timeout-runner-bare.adapter";
import { TimeoutRunnerNoopAdapter } from "../src/timeout-runner-noop.adapter";
import * as mocks from "./mocks";

const TimeoutRunner = new TimeoutRunnerNoopAdapter();

const timeout = tools.Duration.Ms(1);
const over = timeout.times(v.parse(tools.MultiplicationFactor, 2));

const inner = new AntivirusNoopAdapter();
const antivirus = new AntivirusWithTimeoutAdapter({ timeout }, { inner, TimeoutRunner });

describe("AntivirusWithTimeoutAdapter", () => {
  test("scan", async () => {
    expect(async () => antivirus.scan(mocks.cleanFile)).not.toThrow();
  });

  test("scan - timeout", async () => {
    jest.useFakeTimers();
    using _ = spyOn(inner, "scan").mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, over.ms)),
    );
    const TimeoutRunner = new TimeoutRunnerBareAdapter();
    const antivirus = new AntivirusWithTimeoutAdapter({ timeout }, { inner, TimeoutRunner });

    const result = antivirus.scan(mocks.cleanFile);
    jest.runAllTimers();

    expect(result).rejects.toThrow("timeout.exceeded");

    jest.useRealTimers();
  });
});
