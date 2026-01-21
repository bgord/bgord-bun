import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { RedactorCompositeStrategy } from "../src/redactor-composite.strategy";
import { RedactorErrorCauseDepthLimitStrategy } from "../src/redactor-error-cause-depth-limit.strategy";
import { RedactorErrorStackHideStrategy } from "../src/redactor-error-stack-hide.strategy";
import { RedactorMaskStrategy } from "../src/redactor-mask.strategy";
import { RedactorMetadataCompactArrayStrategy } from "../src/redactor-metadata-compact-array.strategy";
import { RedactorMetadataCompactObjectStrategy } from "../src/redactor-metadata-compact-object.strategy";
import { RedactorNoopStrategy } from "../src/redactor-noop.strategy";
import * as mocks from "./mocks";

describe("RedactorCompositeStrategy", () => {
  test("redact", () => {
    const redactor = new RedactorCompositeStrategy([
      new RedactorNoopStrategy(),
      new RedactorMaskStrategy(),
      new RedactorMetadataCompactArrayStrategy(),
      new RedactorMetadataCompactObjectStrategy({ maxKeys: tools.IntegerPositive.parse(3) }),
      new RedactorErrorStackHideStrategy(),
      new RedactorErrorCauseDepthLimitStrategy(1),
    ]);

    const error = new Error(mocks.IntentionalError);
    const first = new Error(mocks.IntentionalCause);
    const second = new Error(mocks.IntentionalCause);
    error.cause = first;
    first.cause = second;

    const log = {
      message: "message",
      component: "infra",
      operation: "test",
      error,
      timestamp: mocks.TIME_ZERO_ISO,
      metadata: {
        password: "secret",
        users: ["1", "2", "3"],
        types: { admin: true, user: true, api: true, anon: true },
      },
    };

    // @ts-expect-error Intentional schema change
    expect(redactor.redact(log)).toEqual({
      ...log,
      timestamp: mocks.TIME_ZERO_ISO,
      error,
      metadata: { password: "***", users: { length: 3, type: "Array" }, types: { type: "Object", keys: 4 } },
    });
  });
});
