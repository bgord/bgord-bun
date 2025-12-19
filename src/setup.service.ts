import * as tools from "@bgord/tools";
import { bodyLimit } from "hono/body-limit";
import { cors } from "hono/cors";
import { languageDetector } from "hono/language";
import { requestId } from "hono/request-id";
import { secureHeaders } from "hono/secure-headers";
import { timing } from "hono/timing";
import { ApiVersion } from "./api-version.middleware";
import type { ClockPort } from "./clock.port";
import { Context } from "./context.middleware";
import { CorrelationStorage } from "./correlation-storage.service";
import { ETagExtractor } from "./etag-extractor.middleware";
import { HttpLogger, type HttpLoggerOptions } from "./http-logger.middleware";
import type { I18nConfigType } from "./i18n.service";
import type { IdProviderPort } from "./id-provider.port";
import type { JsonFileReaderPort } from "./json-file-reader.port";
import type { LoggerPort } from "./logger.port";
import {
  ShieldUserAgentBlockerAdapter,
  type ShieldUserAgentBlockerOptionsType,
} from "./shield-user-agent-blocker.adapter";
import { TimeZoneOffset } from "./time-zone-offset.middleware";
import { WeakETagExtractor } from "./weak-etag-extractor.middleware";

export const BODY_LIMIT_MAX_SIZE = tools.Size.fromKb(128).toBytes();

type SetupOverridesType = {
  cors?: Parameters<typeof cors>[0];
  secureHeaders?: Parameters<typeof secureHeaders>[0];
  httpLogger?: HttpLoggerOptions;
  shieldUserAgentBlocker?: ShieldUserAgentBlockerOptionsType;
};

type Dependencies = {
  Logger: LoggerPort;
  IdProvider: IdProviderPort;
  I18n: I18nConfigType;
  Clock: ClockPort;
  JsonFileReader: JsonFileReaderPort;
};

export class Setup {
  static essentials(deps: Dependencies, overrides?: SetupOverridesType) {
    const corsOptions = overrides?.cors ?? { origin: "*" };
    const secureHeadersOptions = { crossOriginResourcePolicy: "cross-origin", ...overrides?.secureHeaders };

    return [
      secureHeaders(secureHeadersOptions),
      bodyLimit({ maxSize: BODY_LIMIT_MAX_SIZE }),
      new ShieldUserAgentBlockerAdapter(overrides?.shieldUserAgentBlocker).verify,
      ApiVersion.build({ Clock: deps.Clock, JsonFileReader: deps.JsonFileReader }),
      cors(corsOptions),
      languageDetector({
        supportedLanguages: Object.keys(deps.I18n.supportedLanguages),
        fallbackLanguage: deps.I18n.defaultLanguage,
        caches: false,
      }),
      requestId({
        limitLength: 36,
        headerName: "x-correlation-id",
        generator: () => deps.IdProvider.generate(),
      }),
      TimeZoneOffset.attach,
      Context.attach,
      WeakETagExtractor.attach,
      ETagExtractor.attach,
      HttpLogger.build(deps, overrides?.httpLogger),
      timing(),
      CorrelationStorage.handle(),
    ];
  }
}
