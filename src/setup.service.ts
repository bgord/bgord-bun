import * as tools from "@bgord/tools";
import { bodyLimit } from "hono/body-limit";
import { cors } from "hono/cors";
import { languageDetector } from "hono/language";
import { requestId } from "hono/request-id";
import { secureHeaders } from "hono/secure-headers";
import { timing } from "hono/timing";
import { ApiVersion } from "./api-version.middleware";
import type { BuildInfoRepositoryStrategy } from "./build-info-repository.strategy";
import type { CacheResolverStrategy } from "./cache-resolver.strategy";
import type { ClockPort } from "./clock.port";
import { Context } from "./context.middleware";
import { CorrelationStorage } from "./correlation-storage.service";
import { ETagExtractor } from "./etag-extractor.middleware";
import type { HashContentStrategy } from "./hash-content.strategy";
import { HttpLogger, type HttpLoggerOptions } from "./http-logger.middleware";
import type { I18nConfigType } from "./i18n.service";
import type { IdProviderPort } from "./id-provider.port";
import type { LoggerPort } from "./logger.port";
import { MaintenanceMode, type MaintenanceModeConfigType } from "./maintenance-mode.middleware";
import { type ShieldCsrfConfigType, ShieldCsrfStrategy } from "./shield-csrf.strategy";
import { TimeZoneOffset } from "./time-zone-offset.middleware";
import { WeakETagExtractor } from "./weak-etag-extractor.middleware";

type SetupConfigType = {
  csrf: ShieldCsrfConfigType;
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
  CacheResolver: CacheResolverStrategy;
  HashContent: HashContentStrategy;
  BuildInfoRepository: BuildInfoRepositoryStrategy;
};

export class Setup {
  static essentials(config: SetupConfigType, deps: Dependencies) {
    const BODY_LIMIT_MAX_SIZE = config.BODY_LIMIT_MAX_SIZE ?? tools.Size.fromKb(128);

    return [
      MaintenanceMode.build(config.maintenanceMode),
      requestId({
        limitLength: 36,
        headerName: "x-correlation-id",
        generator: () => deps.IdProvider.generate(),
      }),
      ApiVersion.build(deps),
      new ShieldCsrfStrategy(config.csrf).verify,
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
      TimeZoneOffset.attach,
      Context.attach,
      WeakETagExtractor.attach,
      ETagExtractor.attach,
      HttpLogger.build(deps, config.httpLogger),
      timing(),
      CorrelationStorage.handle(),
    ];
  }
}
