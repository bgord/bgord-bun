import type { Express } from "express";
import { ApiVersionExpressMiddleware } from "./api-version-express.middleware";
import type { BuildInfoRepositoryStrategy } from "./build-info-repository.strategy";
import type { CacheResolverStrategy } from "./cache-resolver.strategy";
import type { ClockPort } from "./clock.port";
import { CorrelationExpressMiddleware } from "./correlation-express.middleware";
import { ETagExtractorExpressMiddleware } from "./etag-extractor-express.middleware";
import type { HashContentStrategy } from "./hash-content.strategy";
import type { HttpLoggerConfig } from "./http-logger.middleware";
import { HttpLoggerExpressMiddleware } from "./http-logger-express.middleware";
import type { I18nConfig } from "./i18n.service";
import type { IdProviderPort } from "./id-provider.port";
import type { LoggerPort } from "./logger.port";
import type { ShieldCsrfConfig } from "./shield-csrf.strategy";
import { ShieldCsrfExpressStrategy } from "./shield-csrf-express.strategy";
import type { ShieldMaintenanceConfig } from "./shield-maintenance.strategy";
import { ShieldMaintenanceExpressStrategy } from "./shield-maintenance-express.strategy";
import { TimeZoneOffsetExpressMiddleware } from "./time-zone-offset-express.middleware";
import { TimingExpressMiddleware } from "./timing-express.middleware";
import { TrailingSlashExpressMiddleware } from "./trailing-slash-express.middleware";
import { WeakETagExtractorExpressMiddleware } from "./weak-etag-extractor-express.middleware";

type Dependencies = {
  Logger: LoggerPort;
  IdProvider: IdProviderPort;
  I18n: I18nConfig;
  Clock: ClockPort;
  CacheResolver: CacheResolverStrategy;
  HashContent: HashContentStrategy;
  BuildInfoRepository: BuildInfoRepositoryStrategy;
};

type Config = {
  csrf: ShieldCsrfConfig;
  cors?: { origin: string };
  httpLogger?: HttpLoggerConfig;
  maintenanceMode?: ShieldMaintenanceConfig;
};

export class SetupExpress {
  static essentials(app: Express, config: Config, deps: Dependencies): void {
    app.use(new ShieldMaintenanceExpressStrategy(config.maintenanceMode).handle());
    app.use(new TrailingSlashExpressMiddleware().handle());
    app.use(new CorrelationExpressMiddleware(deps).handle());
    app.use(new ApiVersionExpressMiddleware(deps).handle());
    app.use(new ShieldCsrfExpressStrategy(config.csrf).handle());

    // Secure headers
    app.use((_req, res, next) => {
      res.setHeader("Referrer-Policy", "no-referrer");
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("X-XSS-Protection", "0");
      res.setHeader("Strict-Transport-Security", "max-age=15552000; includeSubDomains");
      res.setHeader("X-Download-Options", "noopen");
      next();
    });

    app.use((req, res, next) => {
      const origin = req.headers.origin;

      res.setHeader("Vary", "Origin");

      // Custom origin override
      if (config.cors?.origin) {
        const allowedOrigin = typeof config.cors.origin === "string" ? config.cors.origin : null;
        if (allowedOrigin && origin === allowedOrigin) {
          res.setHeader("Access-Control-Allow-Origin", origin);
        }
        return next();
      }

      // Default: only allow if no origin (server-to-server) or same-origin
      if (!origin) {
        // No origin header - server-to-server request
        return next();
      }

      // Check if same-origin
      const requestHost = req.headers.host || "";
      const originUrl = new URL(origin);

      // Extract hostname from request host (might include port)
      const requestHostname = requestHost.split(":")[0];

      // Compare hostnames (ignore port differences)
      if (originUrl.hostname === requestHostname) {
        res.setHeader("Access-Control-Allow-Origin", origin);
      }
      // else: cross-origin, don't set header (blocked)

      next();
    });

    // Language detector (simplified - Express doesn't have built-in language detector like Hono)
    app.use((req, _res, next) => {
      const acceptLanguage = req.header("accept-language") || "";
      const supportedLanguages = Object.keys(deps.I18n.supportedLanguages);

      for (const lang of supportedLanguages) {
        if (acceptLanguage.toLowerCase().includes(lang)) {
          (req as any).language = lang;
          return next();
        }
      }

      (req as any).language = deps.I18n.defaultLanguage;
      next();
    });

    app.use(new TimeZoneOffsetExpressMiddleware().handle());
    app.use(new WeakETagExtractorExpressMiddleware().handle());
    app.use(new ETagExtractorExpressMiddleware().handle());
    app.use(new HttpLoggerExpressMiddleware(deps, config.httpLogger).handle());
    app.use(new TimingExpressMiddleware(deps).handle());
  }
}
