import type * as tools from "@bgord/tools";
import type { CacheResolverStrategy } from "./cache-resolver.strategy";
import type { ClockPort } from "./clock.port";
import type { HashContentStrategy } from "./hash-content.strategy";
import type { LoggerPort } from "./logger.port";
import type { PrerequisiteVerifierPort } from "./prerequisite-verifier.port";
import { PrerequisiteVerifierWithCacheAdapter } from "./prerequisite-verifier-with-cache.adapter";
import {
  PrerequisiteVerifierWithFailSafeAdapter,
  type PrerequisiteVerifierWithFailSafeAdapterConfigType,
} from "./prerequisite-verifier-with-fail-safe.adapter";
import { PrerequisiteVerifierWithLoggerAdapter } from "./prerequisite-verifier-with-logger.adapter";
import { PrerequisiteVerifierWithRetryAdapter } from "./prerequisite-verifier-with-retry.adapter";
import { PrerequisiteVerifierWithTimeoutAdapter } from "./prerequisite-verifier-with-timeout.adapter";
import type { RetryConfigType } from "./retry.service";

export type PrerequisiteVerifierDecorator = (verifier: PrerequisiteVerifierPort) => PrerequisiteVerifierPort;

const withTimeout =
  (timeout: tools.Duration): PrerequisiteVerifierDecorator =>
  (inner) =>
    new PrerequisiteVerifierWithTimeoutAdapter({ inner, timeout });

const withCache =
  (
    id: string,
    deps: { CacheResolver: CacheResolverStrategy; HashContent: HashContentStrategy },
  ): PrerequisiteVerifierDecorator =>
  (inner) =>
    new PrerequisiteVerifierWithCacheAdapter({ id, inner }, deps);

const withLogger =
  (deps: { Clock: ClockPort; Logger: LoggerPort }): PrerequisiteVerifierDecorator =>
  (inner) =>
    new PrerequisiteVerifierWithLoggerAdapter({ inner }, deps);

const withRetry =
  (retry: RetryConfigType): PrerequisiteVerifierDecorator =>
  (inner) =>
    new PrerequisiteVerifierWithRetryAdapter({ inner, retry });

const withFailSafe =
  (when: PrerequisiteVerifierWithFailSafeAdapterConfigType): PrerequisiteVerifierDecorator =>
  (inner) =>
    new PrerequisiteVerifierWithFailSafeAdapter({ inner, when });

export const PrerequisiteDecorator = { withTimeout, withCache, withLogger, withRetry, withFailSafe };
