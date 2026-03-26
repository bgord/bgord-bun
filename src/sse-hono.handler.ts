import type * as tools from "@bgord/tools";
import { createFactory } from "hono/factory";
import { streamSSE } from "hono/streaming";
import type { HandlerHonoPort } from "./handler-hono.port";
import type { HashContentStrategy } from "./hash-content.strategy";
import type { Message } from "./message.types";
import { RequestContextHonoAdapter } from "./request-context-hono.adapter";
import type { SseRegistryPort } from "./sse-registry.port";
import { SubjectRequestResolver } from "./subject-request-resolver.vo";
import { SubjectSegmentUserStrategy } from "./subject-segment-user.strategy";

export type SseHonoHandlerConfig = { keepalive: tools.Duration };

type Dependencies<Messages extends Message> = {
  registry: SseRegistryPort<Messages>;
  HashContent: HashContentStrategy;
};

const factory = createFactory();

export class SseHonoHandler<Messages extends Message> implements HandlerHonoPort {
  constructor(
    private readonly config: SseHonoHandlerConfig,
    private readonly deps: Dependencies<Messages>,
  ) {}

  handle() {
    return factory.createHandlers(async (c) => {
      const context = new RequestContextHonoAdapter(c);
      const resolver = new SubjectRequestResolver([new SubjectSegmentUserStrategy()], this.deps);

      const subject = await resolver.resolve(context);

      return streamSSE(c, async (stream) => {
        const send = async <M extends Messages>(message: M) => {
          await stream.writeSSE({ event: message.name, data: JSON.stringify(message) });
        };

        this.deps.registry.register(subject.hex.get(), send);

        stream.onAbort(() => this.deps.registry.unregister(subject.hex.get(), send));

        while (!stream.closed) {
          await stream.sleep(this.config.keepalive.ms);
          await stream.writeSSE({ event: "ping", data: JSON.stringify({ keepalive: true }) });
        }
      });
    });
  }
}
