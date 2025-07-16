import * as tools from "@bgord/tools";
import { uaBlocker } from "@hono/ua-blocker";
import { bodyLimit } from "hono/body-limit";
import { cors } from "hono/cors";
import { languageDetector } from "hono/language";
import { requestId } from "hono/request-id";
import { secureHeaders } from "hono/secure-headers";
import { timing } from "hono/timing";

import { ApiVersion } from "./api-version.middleware";
import { BOTS_REGEX } from "./bots.vo";
import { Context } from "./context.middleware";
import { CorrelationStorage } from "./correlation-storage.service";
import { ETagExtractor } from "./etag-extractor.middleware";
import { HttpLogger } from "./http-logger.middleware";
import { I18nConfigType } from "./i18n.service";
import { Logger } from "./logger.service";
import { TimeZoneOffset } from "./time-zone-offset.middleware";
import { WeakETagExtractor } from "./weak-etag-extractor.middleware";

export const BODY_LIMIT_MAX_SIZE = new tools.Size({
  value: 128,
  unit: tools.SizeUnit.kB,
}).toBytes();

// TODO: test custom cors options
type CorsOptions = Parameters<typeof cors>[0];

type SetupOverridesType = { cors?: CorsOptions };

export class Setup {
  static essentials(logger: Logger, i18n: I18nConfigType, overrides?: SetupOverridesType) {
    const corsOptions = overrides?.cors ?? { origin: "*" };

    return [
      secureHeaders(),
      bodyLimit({ maxSize: BODY_LIMIT_MAX_SIZE }),
      uaBlocker({ blocklist: BOTS_REGEX }),
      ApiVersion.attach,
      cors(corsOptions),
      languageDetector({
        supportedLanguages: Object.keys(i18n.supportedLanguages),
        fallbackLanguage: i18n.defaultLanguage,
      }),
      requestId({ limitLength: 36, headerName: "x-correlation-id" }),
      TimeZoneOffset.attach,
      Context.attach,
      WeakETagExtractor.attach,
      ETagExtractor.attach,
      HttpLogger.build(logger),
      timing(),
      CorrelationStorage.handle(),
    ];
  }
}
