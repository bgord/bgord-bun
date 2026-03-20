import type { SmsPort } from "./sms.port";
import { SmsWithLoggerAdapter, type SmsWithLoggerAdapterDependencies } from "./sms-with-logger.adapter";
import {
  SmsWithRetryAdapter,
  type SmsWithRetryAdapterConfig,
  type SmsWithRetryAdapterDependencies,
} from "./sms-with-retry.adapter";
import {
  SmsWithTimeoutAdapter,
  type SmsWithTimeoutAdapterConfig,
  type SmsWithTimeoutAdapterDependencies,
} from "./sms-with-timeout.adapter";

export class SmsBuilder {
  constructor(private inner: SmsPort) {}

  static of(sms: SmsPort): SmsBuilder {
    return new SmsBuilder(sms);
  }

  withLogger(deps: Omit<SmsWithLoggerAdapterDependencies, "inner">) {
    this.inner = new SmsWithLoggerAdapter({ ...deps, inner: this.inner });
    return this;
  }

  withRetry(config: SmsWithRetryAdapterConfig, deps: Omit<SmsWithRetryAdapterDependencies, "inner">) {
    this.inner = new SmsWithRetryAdapter(config, { ...deps, inner: this.inner });
    return this;
  }

  withTimeout(config: SmsWithTimeoutAdapterConfig, deps: Omit<SmsWithTimeoutAdapterDependencies, "inner">) {
    this.inner = new SmsWithTimeoutAdapter(config, { ...deps, inner: this.inner });
    return this;
  }

  build() {
    return this.inner;
  }
}
