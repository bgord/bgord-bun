// cSpell:ignore upcasted
import type * as tools from "@bgord/tools";
import { CorrelationStorage } from "./correlation-storage.service";
import type { GenericEvent } from "./event.types";
import type { EventLogEntry, EventLogReaderPort } from "./event-log-reader.port";
import type { EventUpcasterPort } from "./event-upcaster.port";
import type { EventValidatorRegistryPort } from "./event-validator-registry.port";
import type { LoggerPort } from "./logger.port";
import type { EventBusPort } from "./message-bus.port";
import type { PayloadSerializerPort } from "./payload-serializer.port";

type Config = { batch: tools.IntegerPositiveType };

type Dependencies<Event extends GenericEvent> = {
  EventLogReader: EventLogReaderPort;
  EventBus: EventBusPort<Event>;
  registry: EventValidatorRegistryPort<Event>;
  serializer: PayloadSerializerPort;
  upcaster?: EventUpcasterPort;
  transaction: (fn: () => Promise<void>) => Promise<void>;
  clear: () => Promise<void>;
  Logger: LoggerPort;
};

export class ProjectionRebuild<Event extends GenericEvent> {
  constructor(
    private readonly config: Config,
    private readonly deps: Dependencies<Event>,
  ) {}

  async run(): Promise<void> {
    await this.deps.transaction(async () => {
      await this.deps.clear();

      for await (const entry of this.entries()) {
        await CorrelationStorage.run(entry.correlationId, () => this.replay(entry));
      }
    });
  }

  private async *entries(): AsyncGenerator<EventLogEntry> {
    let after = 0;

    while (true) {
      const page = await this.deps.EventLogReader.read({
        names: this.deps.registry.names,
        after,
        limit: this.config.batch,
      });

      for (const entry of page) {
        after = entry.position;
        yield entry;
      }

      if (page.length < this.config.batch) return;
    }
  }

  private async replay(entry: EventLogEntry): Promise<void> {
    const { position, ...serialized } = entry;

    try {
      const deserialized = { ...serialized, payload: this.deps.serializer.deserialize(serialized.payload) };
      const upcasted = this.deps.upcaster ? this.deps.upcaster.upcast(deserialized) : deserialized;

      await this.deps.EventBus.emit(this.deps.registry.validate(upcasted));
    } catch (error) {
      this.deps.Logger.error({
        message: "Projection rebuild error",
        correlationId: entry.correlationId,
        component: "infra",
        operation: "projection_rebuild",
        metadata: { position, id: entry.id, name: entry.name },
        error,
      });

      throw error;
    }
  }
}
