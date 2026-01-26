import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { LogLevelEnum } from "../src/logger.port";
import { NodeEnvironmentEnum } from "../src/node-env.vo";
import { WoodchopperSamplingEveryNth } from "../src/woodchopper-sampling-every-nth.strategy";
import * as mocks from "./mocks";

const entryInfo = {
  app: "woodchopper",
  component: "infra",
  environment: NodeEnvironmentEnum.local,
  level: LogLevelEnum.info,
  message: "message",
  operation: "test",
  timestamp: mocks.TIME_ZERO_ISO,
};

const everyTwo = tools.IntegerPositive.parse(2);

describe("WoodchopperSamplingEveryNth", () => {
  test("decide - every n-th", () => {
    const sampling = new WoodchopperSamplingEveryNth(everyTwo);

    expect(sampling.decide(entryInfo)).toEqual(false);
    expect(sampling.decide(entryInfo)).toEqual(true);
    expect(sampling.decide(entryInfo)).toEqual(false);
    expect(sampling.decide(entryInfo)).toEqual(true);
  });
});
