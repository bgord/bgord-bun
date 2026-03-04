import * as tools from "@bgord/tools";
import { bodyLimit } from "hono/body-limit";
import { cors } from "hono/cors";
import { languageDetector } from "hono/language";
import { requestId } from "hono/request-id";
import { secureHeaders } from "hono/secure-headers";
import { timing } from "hono/timing";
import { trimTrailingSlash } from "hono/trailing-slash";
import { ApiVersionHonoMiddleware } from "./api-version-hono.middleware";
import type { BuildInfoRepositoryStrategy } from "./build-info-repository.strategy";
import type { CacheResolverStrategy } from "./cache-resolver.strategy";
import type { ClockPort } from "./clock.port";
import { ContextHonoMiddleware } from "./context-hono.middleware";
import { CorrelationStorageHonoMiddleware } from "./correlation-storage-hono.middleware";
import { ETagExtractorHonoMiddleware } from "./etag-extractor-hono.middleware";
import type { HashContentStrategy } from "./hash-content.strategy";
import type { HttpLoggerConfig } from "./http-logger.middleware";
import { HttpLoggerHonoMiddleware } from "./http-logger-hono.middleware";
import type { I18nConfigType } from "./i18n.service";
import type { IdProviderPort } from "./id-provider.port";
import type { LoggerPort } from "./logger.port";
import type { MaintenanceModeConfigType } from "./maintenance-mode.middleware";
import { MaintenanceModeHonoMiddleware } from "./maintenance-mode-hono.middleware";
import type { ShieldCsrfConfig } from "./shield-csrf.strategy";
import { ShieldCsrfHonoStrategy } from "./shield-csrf-hono.strategy";
import { TimeZoneOffsetHonoMiddleware } from "./time-zone-offset-hono.middleware";
import { WeakETagExtractorHonoMiddleware } from "./weak-etag-extractor-hono.middleware";

type SetupConfigType = {
  csrf: ShieldCsrfConfig;
  cors?: Parameters<typeof cors>[0];
  httpLogger?: HttpLoggerConfig;
  maintenanceMode?: MaintenanceModeConfigType;
  BODY_LIMIT_MAX_SIZE?: tools.Size;
};

type Dependencies = {
  Logger: LoggerPort;
  IdProvider: IdProviderPort;
  I18n: I18nConfigType;
  Clock: ClockPort;
  CacheResolver: CacheResolverStrategy;
  HashContent: HashContentStrategy;
  BuildInfoRepository: BuildInfoRepositoryStrategy;
};

export class Setup {
  static essentials(config: SetupConfigType, deps: Dependencies) {
    const BODY_LIMIT_MAX_SIZE = config.BODY_LIMIT_MAX_SIZE ?? tools.Size.fromKb(128);

    return [
      new MaintenanceModeHonoMiddleware(config.maintenanceMode).handle(),
      trimTrailingSlash({ alwaysRedirect: true }),
      requestId({
        limitLength: 36,
        headerName: "x-correlation-id",
        generator: () => deps.IdProvider.generate(),
      }),
      new ApiVersionHonoMiddleware(deps).handle(),
      new ShieldCsrfHonoStrategy(config.csrf).handle(),
      secureHeaders({
        referrerPolicy: "no-referrer",
        xContentTypeOptions: "nosniff",
        xDnsPrefetchControl: false,
        xDownloadOptions: true,
        xPermittedCrossDomainPolicies: false,
        crossOriginEmbedderPolicy: false,
        crossOriginOpenerPolicy: false,
        crossOriginResourcePolicy: false,
        originAgentCluster: false,
        xFrameOptions: false,
      }),
      bodyLimit({ maxSize: BODY_LIMIT_MAX_SIZE.toBytes() }),
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
        ...config.cors,
      }),
      languageDetector({
        supportedLanguages: Object.keys(deps.I18n.supportedLanguages),
        fallbackLanguage: deps.I18n.defaultLanguage,
        // Stryker disable all
        caches: false,
        // Stryker restore all
      }),
      new TimeZoneOffsetHonoMiddleware().handle(),
      new ContextHonoMiddleware().handle(),
      new WeakETagExtractorHonoMiddleware().handle(),
      new ETagExtractorHonoMiddleware().handle(),
      new HttpLoggerHonoMiddleware(deps, config.httpLogger).handle(),
      timing(),
      new CorrelationStorageHonoMiddleware().handle(),
    ];
  }
}
