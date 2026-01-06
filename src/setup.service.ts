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
import type { FileReaderJsonPort } from "./file-reader-json.port";
import { HttpLogger, type HttpLoggerOptions } from "./http-logger.middleware";
import type { I18nConfigType } from "./i18n.service";
import type { IdProviderPort } from "./id-provider.port";
import type { LoggerPort } from "./logger.port";
import { MaintenanceMode, type MaintenanceModeConfigType } from "./maintenance-mode.middleware";
import { TimeZoneOffset } from "./time-zone-offset.middleware";
import { WeakETagExtractor } from "./weak-etag-extractor.middleware";

type SetupOverridesType = {
  cors?: Parameters<typeof cors>[0];
  httpLogger?: HttpLoggerOptions;
  maintenanceMode?: MaintenanceModeConfigType;
  BODY_LIMIT_MAX_SIZE?: tools.Size;
};

type Dependencies = {
  Logger: LoggerPort;
  IdProvider: IdProviderPort;
  I18n: I18nConfigType;
  Clock: ClockPort;
  FileReaderJson: FileReaderJsonPort;
};

export class Setup {
  static essentials(deps: Dependencies, overrides?: SetupOverridesType) {
    const BODY_LIMIT_MAX_SIZE = overrides?.BODY_LIMIT_MAX_SIZE ?? tools.Size.fromKb(128);

    return [
      MaintenanceMode.build(overrides?.maintenanceMode),
      secureHeaders({
        crossOriginResourcePolicy: "same-origin",
        crossOriginOpenerPolicy: "same-origin",
        crossOriginEmbedderPolicy: "require-corp",
        referrerPolicy: "no-referrer",
        xContentTypeOptions: "nosniff",
      }),
      bodyLimit({ maxSize: BODY_LIMIT_MAX_SIZE.toBytes() }),
      ApiVersion.build({ Clock: deps.Clock, FileReaderJson: deps.FileReaderJson }),
      cors({
        // Stryker disable all
        origin: (origin, c) => {
          // server-to-server, curl, same-origin navigation
          if (!origin) return undefined;

          // same-origin fetch
          if (origin === new URL(c.req.url).origin) return origin;

          // deny cross-origin
          return null;
        },
        // Stryker restore all
        credentials: false,
        maxAge: tools.Duration.Minutes(10).seconds,
        ...overrides?.cors,
      }),
      languageDetector({
        supportedLanguages: Object.keys(deps.I18n.supportedLanguages),
        fallbackLanguage: deps.I18n.defaultLanguage,
        // Stryker disable all
        caches: false,
        // Stryker restore all
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
