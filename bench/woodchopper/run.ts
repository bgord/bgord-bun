import * as tools from "@bgord/tools";
import { ClockSystemAdapter } from "../../src/clock-system.adapter";
import { LogLevelEnum } from "../../src/logger.port";
import { NodeEnvironmentEnum } from "../../src/node-env.vo";
import { Woodchopper } from "../../src/woodchopper";
import { WoodchopperDispatcherSync } from "../../src/woodchopper-dispatcher-sync.strategy";
import { WoodchopperFormatterJson } from "../../src/woodchopper-formatter-json.strategy";
import { WoodchopperSinkBufferedStdout } from "../../src/woodchopper-sink-buffered-stdout.strategy";

const rounding = new tools.RoundingToNearestStrategy();

const WARMUP = 10_000;
const ITERATIONS = 200_000;

const Clock = new ClockSystemAdapter();
const deps = { Clock };

const entry = {
  message: "request handled",
  component: "http",
  operation: "handle",
  correlationId: "0198f7a4-3c2b-7a1e-9d44-6f2b1c8e5a70",
  metadata: { userId: "01HZ0000000000000000000000", durationMs: 12 },
};

function run(iterations: number): void {
  const logger = new Woodchopper(
    {
      app: "bench",
      level: LogLevelEnum.info,
      environment: NodeEnvironmentEnum.production,
      dispatcher: new WoodchopperDispatcherSync(
        new WoodchopperSinkBufferedStdout(new WoodchopperFormatterJson()),
      ),
    },
    deps,
  );

  for (let i = 0; i < iterations; i++) logger.info(entry);
  logger.close();
}

run(WARMUP);

const start = Bun.nanoseconds();
run(ITERATIONS);
const logsPerSecond = rounding.round((ITERATIONS * 1_000_000_000) / (Bun.nanoseconds() - start));

process.stderr.write(`${logsPerSecond} logs/sec\n`);
