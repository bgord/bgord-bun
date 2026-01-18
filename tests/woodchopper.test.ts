import { describe, expect, test } from "bun:test";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { LogLevelEnum } from "../src/logger.port";
import { NodeEnvironmentEnum } from "../src/node-env.vo";
import { Woodchopper } from "../src/woodchopper";
import * as mocks from "./mocks";

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const deps = { Clock };

describe("Woodchopper", () => {
  test("constructor", () => {
    const config = { app: "woodchopper", level: LogLevelEnum.info, environment: NodeEnvironmentEnum.local };

    expect(() => new Woodchopper(config, deps)).not.toThrow();
  });
});
