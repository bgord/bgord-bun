import type { AlertChannelPort } from "./alert-channel.port";
import {
  AlertChannelWithLoggerAdapter,
  type AlertChannelWithLoggerAdapterDependencies,
} from "./alert-channel-with-logger.adapter";
import {
  AlertChannelWithRetryAdapter,
  type AlertChannelWithRetryAdapterConfig,
  type AlertChannelWithRetryAdapterDependencies,
} from "./alert-channel-with-retry.adapter";
import {
  AlertChannelWithTimeoutAdapter,
  type AlertChannelWithTimeoutAdapterConfig,
  type AlertChannelWithTimeoutAdapterDependencies,
} from "./alert-channel-with-timeout.adapter";

export class AlertChannelBuilder {
  constructor(private inner: AlertChannelPort) {}

  static of(channel: AlertChannelPort): AlertChannelBuilder {
    return new AlertChannelBuilder(channel);
  }

  withLogger(deps: Omit<AlertChannelWithLoggerAdapterDependencies, "inner">) {
    this.inner = new AlertChannelWithLoggerAdapter({ ...deps, inner: this.inner });
    return this;
  }

  withRetry(
    config: AlertChannelWithRetryAdapterConfig,
    deps: Omit<AlertChannelWithRetryAdapterDependencies, "inner">,
  ) {
    this.inner = new AlertChannelWithRetryAdapter(config, { ...deps, inner: this.inner });
    return this;
  }

  withTimeout(
    config: AlertChannelWithTimeoutAdapterConfig,
    deps: Omit<AlertChannelWithTimeoutAdapterDependencies, "inner">,
  ) {
    this.inner = new AlertChannelWithTimeoutAdapter(config, { ...deps, inner: this.inner });
    return this;
  }

  build(): AlertChannelPort {
    return this.inner;
  }
}
