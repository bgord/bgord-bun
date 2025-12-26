import type * as tools from "@bgord/tools";
import type { CacheResolverPort } from "./cache-resolver.port";
import type { ClockPort } from "./clock.port";
import type { HashContentPort } from "./hash-content.port";
import type { LoggerPort } from "./logger.port";
import type { PrerequisiteVerifierPort } from "./prerequisite-verifier.port";
import { PrerequisiteVerifierWithCacheAdapter } from "./prerequisite-verifier-with-cache.adapter";
import { PrerequisiteVerifierWithLoggerAdapter } from "./prerequisite-verifier-with-logger.adapter";
import { PrerequisiteVerifierWithTimeoutAdapter } from "./prerequisite-verifier-with-timeout.adapter";

export type PrerequisiteVerifierDecorator = (verifier: PrerequisiteVerifierPort) => PrerequisiteVerifierPort;

const withTimeout =
  (timeout: tools.Duration): PrerequisiteVerifierDecorator =>
  (inner) =>
    new PrerequisiteVerifierWithTimeoutAdapter({ inner, timeout });

const withCache =
  (
    id: string,
    deps: { CacheResolver: CacheResolverPort; HashContent: HashContentPort },
  ): PrerequisiteVerifierDecorator =>
  (inner) =>
    new PrerequisiteVerifierWithCacheAdapter({ id, inner }, deps);

const withLogger =
  (deps: { Clock: ClockPort; Logger: LoggerPort }): PrerequisiteVerifierDecorator =>
  (inner) =>
    new PrerequisiteVerifierWithLoggerAdapter({ inner }, deps);

export const PrerequisiteDecorator = { withTimeout, withCache, withLogger };
