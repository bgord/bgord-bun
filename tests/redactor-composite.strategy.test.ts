import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { RedactorComposite } from "../src/redactor-composite.strategy";
import { RedactorErrorCauseDepthLimit } from "../src/redactor-error-cause-depth-limit.strategy";
import { RedactorErrorStackHide } from "../src/redactor-error-stack-hide.strategy";
import { RedactorMask } from "../src/redactor-mask.strategy";
import { RedactorMetadataCompactArray } from "../src/redactor-metadata-compact-array.strategy";
import { RedactorMetadataCompactObject } from "../src/redactor-metadata-compact-object.strategy";
import { RedactorNoop } from "../src/redactor-noop.strategy";
import * as mocks from "./mocks";

describe("RedactorComposite", () => {
  test("redact", () => {
    const redactor = new RedactorComposite([
      new RedactorNoop(),
      new RedactorMask(),
      new RedactorMetadataCompactArray({ maxItems: tools.IntegerPositive.parse(2) }),
      new RedactorMetadataCompactObject({ maxKeys: tools.IntegerPositive.parse(3) }),
      new RedactorErrorStackHide(),
      new RedactorErrorCauseDepthLimit(tools.IntegerNonNegative.parse(1)),
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
        types: { admin: true, user: true, api: true, bots: true },
      },
    };

    // @ts-expect-error Changed schema assertion
    expect(redactor.redact(log)).toEqual({
      ...log,
      timestamp: mocks.TIME_ZERO_ISO,
      error,
      metadata: { password: "***", users: { length: 3, type: "Array" }, types: { type: "Object", keys: 4 } },
    });
  });
});
