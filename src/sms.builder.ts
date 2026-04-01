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
  constructor(private readonly inner: SmsPort) {}

  static of(sms: SmsPort): SmsBuilder {
    return new SmsBuilder(sms);
  }

  withLogger(deps: Omit<SmsWithLoggerAdapterDependencies, "inner">) {
    return SmsBuilder.of(new SmsWithLoggerAdapter({ ...deps, inner: this.inner }));
  }

  withRetry(config: SmsWithRetryAdapterConfig, deps: Omit<SmsWithRetryAdapterDependencies, "inner">) {
    return SmsBuilder.of(new SmsWithRetryAdapter(config, { ...deps, inner: this.inner }));
  }

  withTimeout(config: SmsWithTimeoutAdapterConfig, deps: Omit<SmsWithTimeoutAdapterDependencies, "inner">) {
    return SmsBuilder.of(new SmsWithTimeoutAdapter(config, { ...deps, inner: this.inner }));
  }

  build() {
    return this.inner;
  }
}
