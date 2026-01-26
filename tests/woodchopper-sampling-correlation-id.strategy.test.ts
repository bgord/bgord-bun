import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { LogLevelEnum } from "../src/logger.port";
import { NodeEnvironmentEnum } from "../src/node-env.vo";
import { WoodchoperSamplingCorrelationId } from "../src/woodchopper-sampling-correlation-id.strategy";
import * as mocks from "./mocks";

const entryWithCorrelation = {
  app: "woodchopper",
  component: "infra",
  environment: NodeEnvironmentEnum.local,
  level: LogLevelEnum.info,
  message: "message",
  operation: "test",
  correlationId: "550e8400-e29b-41d4-a716-446655440000",
  timestamp: mocks.TIME_ZERO_ISO,
};

const entryWithDifferentCorrelation = {
  ...entryWithCorrelation,
  correlationId: "550e8400-e29b-41d4-a716-446655440001",
};

const entryWithoutCorrelation = {
  ...entryWithCorrelation,
  correlationId: undefined,
};

const two = tools.IntegerPositive.parse(2);

describe("WoodchoperSamplingCorrelationId", () => {
  test("decide - determinism", () => {
    const strategy = new WoodchoperSamplingCorrelationId({ everyNth: two });

    const first = strategy.decide(entryWithCorrelation);
    const second = strategy.decide(entryWithCorrelation);
    const third = strategy.decide(entryWithCorrelation);

    expect(first).toEqual(second);
    expect(second).toEqual(third);
  });

  test("decide - different entries", () => {
    const strategy = new WoodchoperSamplingCorrelationId({ everyNth: two });

    const first = strategy.decide(entryWithCorrelation);
    const second = strategy.decide(entryWithDifferentCorrelation);

    expect(first).not.toEqual(undefined);
    expect(second).not.toEqual(undefined);
  });

  test("decide - false - no correlation id", () => {
    const strategy = new WoodchoperSamplingCorrelationId({ everyNth: two });

    expect(strategy.decide(entryWithoutCorrelation)).toEqual(false);
  });
});
