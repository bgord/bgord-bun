import { describe, expect, test } from "bun:test";
import { LogLevelEnum } from "../src/logger.port";
import { NodeEnvironmentEnum } from "../src/node-env.vo";
import { WoodchopperSamplingPassLevel } from "../src/woodchopper-sampling-pass-level.strategy";
import * as mocks from "./mocks";

const entry = {
  app: "woodchopper",
  component: "infra",
  environment: NodeEnvironmentEnum.local,
  message: "message",
  operation: "test",
  timestamp: mocks.TIME_ZERO_ISO,
};

const sampling = new WoodchopperSamplingPassLevel([LogLevelEnum.error, LogLevelEnum.warn]);

describe("WoodchopperSamplingPassLevel", () => {
  test("decide", () => {
    expect(sampling.decide({ ...entry, level: LogLevelEnum.error })).toEqual(true);
    expect(sampling.decide({ ...entry, level: LogLevelEnum.warn })).toEqual(true);
    expect(sampling.decide({ ...entry, level: LogLevelEnum.info })).toEqual(false);
    expect(sampling.decide({ ...entry, level: LogLevelEnum.http })).toEqual(false);
    expect(sampling.decide({ ...entry, level: LogLevelEnum.verbose })).toEqual(false);
    expect(sampling.decide({ ...entry, level: LogLevelEnum.debug })).toEqual(false);
    expect(sampling.decide({ ...entry, level: LogLevelEnum.silly })).toEqual(false);
  });
});
