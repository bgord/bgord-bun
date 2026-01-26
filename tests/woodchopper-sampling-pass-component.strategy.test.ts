import { describe, expect, test } from "bun:test";
import { LogLevelEnum } from "../src/logger.port";
import { NodeEnvironmentEnum } from "../src/node-env.vo";
import { WoodchopperSamplingPassComponent } from "../src/woodchopper-sampling-pass-component.strategy";
import * as mocks from "./mocks";

const entry = {
  app: "woodchopper",
  environment: NodeEnvironmentEnum.local,
  level: LogLevelEnum.info,
  message: "message",
  operation: "test",
  timestamp: mocks.TIME_ZERO_ISO,
};

const sampling = new WoodchopperSamplingPassComponent(["infra", "security"]);

describe("WoodchopperSamplingPassComponent", () => {
  test("decide", () => {
    expect(sampling.decide({ ...entry, component: "infra" })).toEqual(true);
    expect(sampling.decide({ ...entry, component: "security" })).toEqual(true);
    expect(sampling.decide({ ...entry, component: "auth" })).toEqual(false);
  });
});
