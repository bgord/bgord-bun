import { describe, expect, test } from "bun:test";
import { LogLevelEnum } from "../src/logger.port";
import { NodeEnvironmentEnum } from "../src/node-env.vo";
import { Woodchopper } from "../src/woodchopper";

describe("Woodchopper", () => {
  test("constructor", () => {
    const config = { app: "woodchopper", level: LogLevelEnum.info, environment: NodeEnvironmentEnum.local };

    expect(() => new Woodchopper(config)).not.toThrow();
  });
});
