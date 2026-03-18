import type { MailerPort } from "./mailer.port";
import {
  MailerWithLoggerAdapter,
  type MailerWithLoggerAdapterDependencies,
} from "./mailer-with-logger.adapter";
import {
  MailerWithRetryAdapter,
  type MailerWithRetryAdapterConfig,
  type MailerWithRetryAdapterDependencies,
} from "./mailer-with-retry.adapter";
import {
  MailerWithTimeoutAdapter,
  type MailerWithTimeoutAdapterConfig,
  type MailerWithTimeoutAdapterDependencies,
} from "./mailer-with-timeout.adapter";

export class MailerBuilder {
  constructor(private inner: MailerPort) {}

  static of(mailer: MailerPort): MailerBuilder {
    return new MailerBuilder(mailer);
  }

  withLogger(deps: Omit<MailerWithLoggerAdapterDependencies, "inner">) {
    this.inner = new MailerWithLoggerAdapter({ ...deps, inner: this.inner });
    return this;
  }

  withRetry(config: MailerWithRetryAdapterConfig, deps: Omit<MailerWithRetryAdapterDependencies, "inner">) {
    this.inner = new MailerWithRetryAdapter(config, { ...deps, inner: this.inner });
    return this;
  }

  withTimeout(
    config: MailerWithTimeoutAdapterConfig,
    deps: Omit<MailerWithTimeoutAdapterDependencies, "inner">,
  ) {
    this.inner = new MailerWithTimeoutAdapter(config, { ...deps, inner: this.inner });
    return this;
  }

  build() {
    return this.inner;
  }
}
