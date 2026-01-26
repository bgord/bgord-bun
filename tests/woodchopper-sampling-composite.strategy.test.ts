import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { LogLevelEnum } from "../src/logger.port";
import { NodeEnvironmentEnum } from "../src/node-env.vo";
import { WoodchopperSamplingComposite } from "../src/woodchopper-sampling-composite.strategy";
import { WoodchopperSamplingEveryNth } from "../src/woodchopper-sampling-every-nth.strategy";
import { WoodchopperSamplingPassLevel } from "../src/woodchopper-sampling-pass-level.strategy";
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
const entryError = { ...entryInfo, level: LogLevelEnum.error };
const entryWarn = { ...entryInfo, level: LogLevelEnum.warn };

const two = tools.IntegerPositive.parse(2);

describe("WoodchopperSamplingComposite", () => {
  test("decide - every n-th", () => {
    const passthrough = new WoodchopperSamplingPassLevel([LogLevelEnum.error, LogLevelEnum.warn]);
    const everyNth = new WoodchopperSamplingEveryNth({ n: two });
    const sampling = new WoodchopperSamplingComposite([passthrough, everyNth]);

    expect(sampling.decide(entryInfo)).toEqual(false);
    expect(sampling.decide(entryInfo)).toEqual(true);
    expect(sampling.decide(entryInfo)).toEqual(false);
    expect(sampling.decide(entryInfo)).toEqual(true);
  });

  test("decide - error and warn", () => {
    const passthrough = new WoodchopperSamplingPassLevel([LogLevelEnum.error, LogLevelEnum.warn]);
    const everyNth = new WoodchopperSamplingEveryNth({ n: two });
    const sampling = new WoodchopperSamplingComposite([passthrough, everyNth]);

    expect(sampling.decide(entryError)).toEqual(true);
    expect(sampling.decide(entryWarn)).toEqual(true);
    expect(sampling.decide(entryError)).toEqual(true);
    expect(sampling.decide(entryWarn)).toEqual(true);
  });

  test("decide - mixed", () => {
    const passthrough = new WoodchopperSamplingPassLevel([LogLevelEnum.error, LogLevelEnum.warn]);
    const everyNth = new WoodchopperSamplingEveryNth({ n: two });
    const sampling = new WoodchopperSamplingComposite([passthrough, everyNth]);

    expect(sampling.decide(entryInfo)).toEqual(false);
    expect(sampling.decide(entryError)).toEqual(true);
    expect(sampling.decide(entryInfo)).toEqual(true);
    expect(sampling.decide(entryWarn)).toEqual(true);
    expect(sampling.decide(entryInfo)).toEqual(false);
  });
});
