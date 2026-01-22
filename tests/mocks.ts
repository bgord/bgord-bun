import { expect } from "bun:test";
import * as tools from "@bgord/tools";
import { Client } from "../src/client.vo";
import { ClientIp } from "../src/client-ip.vo";
import { ClientUserAgent } from "../src/client-user-agent.vo";
import { CommitSha } from "../src/commit-sha.vo";
import { Hash } from "../src/hash.vo";
import { HashValue } from "../src/hash-value.vo";
import type * as System from "../src/modules/system";
import { Prerequisite } from "../src/prerequisite.vo";
import {
  PrerequisiteVerification,
  type PrerequisiteVerificationResult,
  type PrerequisiteVerifierPort,
} from "../src/prerequisite-verifier.port";
import { SecurityCountermeasureName } from "../src/security-countermeasure-name.vo";

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

export const IntentionalCause = "intentional.cause" as const;
export const IntentionalError = "intentional.error" as const;
export const throwIntentionalError = () => {
  throw new Error(IntentionalError);
};
export const throwIntentionalErrorAsync = async () => {
  throw new Error(IntentionalError);
};

export const IntentionalErrorNormalized = {
  cause: undefined,
  message: IntentionalError,
  name: "Error",
  stack: expect.any(String),
};

export const ip = "127.0.0.1";
export const ua = "firefox";
export const client = Client.fromParts(ip, ua);
export const clientEmpty = Client.fromParts(undefined, undefined);

export const connInfo = { server: { requestIP: () => ({ address: ip }) } };

// Tue Nov 14 2023 22:13:20 GMT+0000
export const TIME_ZERO = tools.Timestamp.fromNumber(1700000000000);

export const TIME_ZERO_DATE = "2023-11-14";

export const TIME_ZERO_ISO = "2023-11-14T22:13:20.000Z";

export const TIME_ZERO_DATE_UTC = new Date(TIME_ZERO.ms).toUTCString();

export const SHA = CommitSha.fromString("a".repeat(40));

export class PrerequisiteVerifierPass implements PrerequisiteVerifierPort {
  async verify(): Promise<PrerequisiteVerificationResult> {
    return PrerequisiteVerification.success;
  }

  get kind() {
    return "test";
  }
}
export const PrerequisiteOk = new Prerequisite("ok", new PrerequisiteVerifierPass());

export class PrerequisiteVerifierFail implements PrerequisiteVerifierPort {
  async verify(): Promise<PrerequisiteVerificationResult> {
    return PrerequisiteVerification.failure(IntentionalError);
  }

  get kind() {
    return "test";
  }
}
export const PrerequisiteFail = new Prerequisite("fail", new PrerequisiteVerifierFail());

export class PrerequisiteVerifierUndetermined implements PrerequisiteVerifierPort {
  async verify(): Promise<PrerequisiteVerificationResult> {
    return PrerequisiteVerification.undetermined;
  }

  get kind() {
    return "test";
  }
}
export const PrerequisiteUndetermined = new Prerequisite(
  "undetermined",
  new PrerequisiteVerifierUndetermined(),
);

export class PrerequisiteVerifierFailThenPass implements PrerequisiteVerifierPort {
  private calls = 1;

  async verify(): Promise<PrerequisiteVerificationResult> {
    if (this.calls < 3) {
      this.calls++;
      return PrerequisiteVerification.failure(IntentionalError);
    }
    return PrerequisiteVerification.success;
  }

  get kind() {
    return "test";
  }
}

export class PrerequisiteVerifierFailWithStack implements PrerequisiteVerifierPort {
  async verify(): Promise<PrerequisiteVerificationResult> {
    return PrerequisiteVerification.failure(new Error(IntentionalError));
  }

  get kind() {
    return "test";
  }
}
export const PrerequisiteFailWithStack = new Prerequisite(
  "fail-with-stack",
  new PrerequisiteVerifierFailWithStack(),
);

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

export const GenericSecurityViolationDetectedBanDenyEvent = {
  id: correlationId,
  correlationId,
  createdAt: TIME_ZERO.ms,
  stream: "security",
  version: 1,
  name: "SECURITY_VIOLATION_DETECTED_EVENT",
  payload: {
    rule: expect.any(String),
    client: { ip: ClientIp.parse(ip), ua: ClientUserAgent.parse(ua) },
    userId: undefined,
    countermeasure: SecurityCountermeasureName.parse("ban"),
    action: "deny",
  },
} satisfies System.Events.SecurityViolationDetectedEventType;

export const GenericSecurityViolationDetectedBanDenyWithoutContextEvent = {
  id: correlationId,
  correlationId,
  createdAt: TIME_ZERO.ms,
  stream: "security",
  version: 1,
  name: "SECURITY_VIOLATION_DETECTED_EVENT",
  payload: {
    rule: expect.any(String),
    client: { ip: undefined, ua: undefined },
    userId: undefined,
    countermeasure: SecurityCountermeasureName.parse("ban"),
    action: "deny",
  },
} satisfies System.Events.SecurityViolationDetectedEventType;

export async function tick() {
  await Promise.resolve();
}
