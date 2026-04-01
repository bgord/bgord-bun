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
  constructor(private readonly inner: AlertChannelPort) {}

  static of(channel: AlertChannelPort): AlertChannelBuilder {
    return new AlertChannelBuilder(channel);
  }

  withLogger(deps: Omit<AlertChannelWithLoggerAdapterDependencies, "inner">) {
    return AlertChannelBuilder.of(new AlertChannelWithLoggerAdapter({ ...deps, inner: this.inner }));
  }

  withRetry(
    config: AlertChannelWithRetryAdapterConfig,
    deps: Omit<AlertChannelWithRetryAdapterDependencies, "inner">,
  ) {
    return AlertChannelBuilder.of(new AlertChannelWithRetryAdapter(config, { ...deps, inner: this.inner }));
  }

  withTimeout(
    config: AlertChannelWithTimeoutAdapterConfig,
    deps: Omit<AlertChannelWithTimeoutAdapterDependencies, "inner">,
  ) {
    return AlertChannelBuilder.of(new AlertChannelWithTimeoutAdapter(config, { ...deps, inner: this.inner }));
  }

  build(): AlertChannelPort {
    return this.inner;
  }
}
