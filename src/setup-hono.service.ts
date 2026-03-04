import * as tools from "@bgord/tools";
import { cors } from "hono/cors";
import { languageDetector } from "hono/language";
import { secureHeaders } from "hono/secure-headers";
import { ApiVersionHonoMiddleware } from "./api-version-hono.middleware";
import type { BuildInfoRepositoryStrategy } from "./build-info-repository.strategy";
import type { CacheResolverStrategy } from "./cache-resolver.strategy";
import type { ClockPort } from "./clock.port";
import { ContextHonoMiddleware } from "./context-hono.middleware";
import { CorrelationHonoMiddleware } from "./correlation-hono.middleware";
import { ETagExtractorHonoMiddleware } from "./etag-extractor-hono.middleware";
import type { HashContentStrategy } from "./hash-content.strategy";
import type { HttpLoggerConfig } from "./http-logger.middleware";
import { HttpLoggerHonoMiddleware } from "./http-logger-hono.middleware";
import type { I18nConfigType } from "./i18n.service";
import type { IdProviderPort } from "./id-provider.port";
import type { LoggerPort } from "./logger.port";
import type { ShieldCsrfConfig } from "./shield-csrf.strategy";
import { ShieldCsrfHonoStrategy } from "./shield-csrf-hono.strategy";
import type { ShieldMaintenanceConfigType } from "./shield-maintenance.strategy";
import { ShieldMaintenanceHonoStrategy } from "./shield-maintenance-hono.strategy";
import { TimeZoneOffsetHonoMiddleware } from "./time-zone-offset-hono.middleware";
import { TimingHonoMiddleware } from "./timing-hono.middleware";
import { TrailingSlashHonoMiddleware } from "./trailing-slash-hono.middleware";
import { WeakETagExtractorHonoMiddleware } from "./weak-etag-extractor-hono.middleware";

type SetupConfigType = {
  csrf: ShieldCsrfConfig;
  cors?: Parameters<typeof cors>[0];
  httpLogger?: HttpLoggerConfig;
  maintenanceMode?: ShieldMaintenanceConfigType;
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

export class SetupHono {
  // Configure body size limit at the framework level
  // - Bun: maxRequestBodySize in Bun.serve()
  // - Express: limit in express.json()
  static essentials(config: SetupConfigType, deps: Dependencies) {
    return [
      new ShieldMaintenanceHonoStrategy(config.maintenanceMode).handle(),
      new TrailingSlashHonoMiddleware().handle(),
      new CorrelationHonoMiddleware(deps).handle(),
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
      new TimingHonoMiddleware(deps).handle(),
    ];
  }
}
