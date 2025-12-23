import { describe, expect, jest, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import {
  SecurityCountermeasureTarpitAdapter,
  SecurityCountermeasureTarpitAdapterError,
} from "../src/security-countermeasure-tarpit.adapter";
import * as mocks from "./mocks";

const context = { client: { ip: "anon", ua: "anon" } };

const config = { delay: tools.Duration.Seconds(5) };
const Logger = new LoggerNoopAdapter();
const deps = { Logger };

const countermeasure = new SecurityCountermeasureTarpitAdapter(config, deps);

describe("SecurityCountermeasureTarpitAdapter", () => {
  test("happy path", async () => {
    const bunSleep = spyOn(Bun, "sleep").mockImplementation(jest.fn());
    const loggerInfo = spyOn(Logger, "info");

    await CorrelationStorage.run(mocks.correlationId, async () => {
      expect(async () => countermeasure.execute(context)).toThrow(
        SecurityCountermeasureTarpitAdapterError.Executed,
      );
    });

    expect(bunSleep).toHaveBeenCalledWith(config.delay.ms);
    expect(loggerInfo).toHaveBeenCalledWith({
      message: "Security countermeasure tarpit",
      component: "security",
      operation: "security_countermeasure_tarpit",
      correlationId: mocks.correlationId,
      metadata: context,
    });
  });
});
