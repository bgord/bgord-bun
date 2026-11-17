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

export class MailerBuilder {
  constructor(private readonly inner: MailerPort) {}

  static of(mailer: MailerPort): MailerBuilder {
    return new MailerBuilder(mailer);
  }

  withLogger(deps: Omit<MailerWithLoggerAdapterDependencies, "inner">) {
    return MailerBuilder.of(new MailerWithLoggerAdapter({ ...deps, inner: this.inner }));
  }

  withRetry(config: MailerWithRetryAdapterConfig, deps: Omit<MailerWithRetryAdapterDependencies, "inner">) {
    return MailerBuilder.of(new MailerWithRetryAdapter(config, { ...deps, inner: this.inner }));
  }

  build() {
    return this.inner;
  }
}
