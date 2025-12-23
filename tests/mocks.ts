import { expect } from "bun:test";
import { Writable } from "node:stream";
import * as tools from "@bgord/tools";
import type { Context } from "hono";
import * as winston from "winston";
import type { ClockPort } from "../src/clock.port";
import { Hash } from "../src/hash.vo";
import { HashValue } from "../src/hash-value.vo";
import type * as System from "../src/modules/system";
import * as prereqs from "../src/prerequisites.service";
import { PrerequisiteStatusEnum } from "../src/prerequisites.service";

export const correlationId = "00000000-0000-0000-0000-000000000000";

export type Config = { Variables: { user: { id: string | undefined } } };

export function stringToStream(string: string): ReadableStream<Uint8Array> {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(string));
      controller.close();
    },
  });
}

export const IntentionalError = "intentional.error" as const;
export const throwIntentionalError = () => {
  throw new Error(IntentionalError);
};
export const throwIntentionalErrorAsync = async () => {
  throw new Error(IntentionalError);
};

export function makeCaptureTransport() {
  const lines: string[] = [];
  const stream = new Writable({
    write(chunk, _enc, cb) {
      lines.push(chunk.toString()); // pretty or single-line JSON; both OK
      cb();
    },
  });

  const transport = new winston.transports.Stream({ stream });

  return { transport, lines };
}

export function createContext(headers: Record<string, string | undefined>): Context {
  return {
    req: { header: (name: string) => headers[name.toLowerCase()] ?? undefined },
    env: { server: { requestIP: () => ({ address: "127.0.0.1" }) } },
  } as unknown as Context;
}

export const ip = { server: { requestIP: () => ({ address: "127.0.0.1" }) } };

// Tue Nov 14 2023 22:13:20 GMT+0000
export const TIME_ZERO = tools.Timestamp.fromNumber(1700000000000);

export const TIME_ZERO_DATE = "2023-11-14";

export const TIME_ZERO_DATE_UTC = new Date(TIME_ZERO.ms).toUTCString();

export const VerificationSuccess = { status: PrerequisiteStatusEnum.success, durationMs: expect.any(Number) };

export const VerificationUndetermined = {
  status: PrerequisiteStatusEnum.undetermined,
  durationMs: expect.any(Number),
};

export const VerificationFailure = (error?: any) => ({
  status: PrerequisiteStatusEnum.failure,
  durationMs: expect.any(Number),
  error,
});

export class PrerequisiteOk implements prereqs.Prerequisite {
  readonly label = "ok";
  readonly kind = "test";
  readonly enabled = true;
  async verify(clock: ClockPort): Promise<prereqs.VerifyOutcome> {
    const stopwatch = new tools.Stopwatch(clock.now());
    return prereqs.Verification.success(stopwatch.stop());
  }
}

export class PrerequisiteFail implements prereqs.Prerequisite {
  readonly label = "fail";
  readonly kind = "test";
  readonly enabled = true;
  async verify(clock: ClockPort): Promise<prereqs.VerifyOutcome> {
    const stopwatch = new tools.Stopwatch(clock.now());
    return prereqs.Verification.failure(stopwatch.stop(), { message: "boom" });
  }
}

export class PrerequisiteUndetermined implements prereqs.Prerequisite {
  readonly label = "undetermined";
  readonly kind = "test";
  readonly enabled = false;
  async verify(clock: ClockPort): Promise<prereqs.VerifyOutcome> {
    const stopwatch = new tools.Stopwatch(clock.now());
    return prereqs.Verification.undetermined(stopwatch.stop());
  }
}

export const hashValue = HashValue.parse("0000000000000000000000000000000000000000000000000000000000000000");
export const hash = Hash.fromValue(hashValue);

export const expectAnyId = expect.stringMatching(
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
);

export const GenericHourHasPassedEvent = {
  id: correlationId,
  correlationId,
  createdAt: TIME_ZERO.ms,
  stream: "passage_of_time",
  version: 1,
  name: "HOUR_HAS_PASSED_EVENT",
  payload: { timestamp: TIME_ZERO.ms },
} satisfies System.Events.HourHasPassedEventType;

export const GenericMinuteHasPassedEvent = {
  id: correlationId,
  correlationId,
  createdAt: TIME_ZERO.ms,
  stream: "passage_of_time",
  version: 1,
  name: "MINUTE_HAS_PASSED_EVENT",
  payload: { timestamp: TIME_ZERO.ms },
} satisfies System.Events.MinuteHasPassedEventType;

export const GenericSecurityViolationDetectedEvent = {
  id: correlationId,
  correlationId,
  createdAt: TIME_ZERO.ms,
  stream: "security",
  version: 1,
  name: "SECURITY_VIOLATION_DETECTED_EVENT",
  payload: { rule: expect.any(String), client: { ip: "anon", ua: "anon" }, userId: undefined },
} satisfies System.Events.SecurityViolationDetectedEventType;
