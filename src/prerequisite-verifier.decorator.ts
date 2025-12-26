import type * as tools from "@bgord/tools";
import type { CacheResolverPort } from "./cache-resolver.port";
import type { HashContentPort } from "./hash-content.port";
import type { LoggerPort } from "./logger.port";
import type { PrerequisiteVerifierPort } from "./prerequisite-verifier.port";
import { PrerequisiteVerifierCacheAdapter } from "./prerequisite-verifier-cache.adapter";
import { PrerequisiteVerifierLoggerAdapter } from "./prerequisite-verifier-logger.adapter";
import { PrerequisiteVerifierTimeoutAdapter } from "./prerequisite-verifier-timeout.adapter";

export type PrerequisiteVerifierDecorator = (verifier: PrerequisiteVerifierPort) => PrerequisiteVerifierPort;

const withTimeout =
  (timeout: tools.Duration): PrerequisiteVerifierDecorator =>
  (inner) =>
    new PrerequisiteVerifierTimeoutAdapter({ inner, timeout });

const withCache =
  (
    id: string,
    deps: { CacheResolver: CacheResolverPort; HashContent: HashContentPort },
  ): PrerequisiteVerifierDecorator =>
  (inner) =>
    new PrerequisiteVerifierCacheAdapter({ id, inner }, deps);

const withLogger =
  (deps: { Logger: LoggerPort }): PrerequisiteVerifierDecorator =>
  (inner) =>
    new PrerequisiteVerifierLoggerAdapter({ inner }, deps);

export const PrerequisiteDecorator = { withTimeout, withCache, withLogger };
