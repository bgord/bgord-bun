import * as bgn from "@bgord/node";
import { bodyLimit } from "hono/body-limit";
import { cors } from "hono/cors";
import { requestId } from "hono/request-id";
import { secureHeaders } from "hono/secure-headers";
import { timing } from "hono/timing";

import { ApiVersion } from "./api-version";
import { Context } from "./context";
import { ETagExtractor, WeakETagExtractor } from "./etag-extractor";
import { HttpLogger } from "./http-logger";
import { TimeZoneOffset } from "./time-zone-offset";

export const BODY_LIMIT_MAX_SIZE = new bgn.Size({
  value: 128,
  unit: bgn.SizeUnit.kB,
}).toBytes();

export class Setup {
  static essentials(logger: bgn.Logger) {
    return [
      secureHeaders(),
      bodyLimit({ maxSize: BODY_LIMIT_MAX_SIZE }),
      ApiVersion.attach,
      cors({ origin: "*" }),
      requestId(),
      TimeZoneOffset.attach,
      Context.attach,
      WeakETagExtractor.attach,
      ETagExtractor.attach,
      HttpLogger.build(logger),
      timing(),
    ];
  }
}
