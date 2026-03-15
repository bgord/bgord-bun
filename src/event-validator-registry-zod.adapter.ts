import type * as z from "zod/v4";
import type { GenericEvent } from "./event.types";
import type { EventValidatorRegistryPort } from "./event-validator-registry.port";

export type GenericEventSchema = z.ZodObject<{
  id: z.ZodType<string>;
  correlationId: z.ZodType<string>;
  createdAt: z.ZodType<number>;
  stream: z.ZodString;
  revision: z.ZodOptional<z.ZodType<number>>;
  name: z.ZodLiteral<string>;
  version: z.ZodLiteral<number>;
  payload: z.ZodType<any>;
}>;

export type GenericParsedEventSchema = z.ZodObject<
  Omit<GenericEventSchema["shape"], "payload"> & { payload: z.ZodString }
>;

const EventValidatorRegistryZodAdapterError = {
  MissingName: "event.validator.registry.zod.adapter.error.missing.name",
  UnknownEvent: "event.validator.registry.zod.adapter.error.unknown.event",
};

export class EventValidatorRegistryZodAdapter<TEvent> implements EventValidatorRegistryPort<TEvent> {
  private readonly map: Map<GenericEvent["name"], GenericEventSchema>;
  readonly names: ReadonlyArray<GenericEvent["name"]>;

  constructor(schemas: ReadonlyArray<GenericEventSchema>) {
    this.map = new Map(schemas.map((schema) => [schema.shape.name.value, schema]));
    this.names = [...this.map.keys()];
  }

  accepts(name: GenericEvent["name"]): boolean {
    return this.map.has(name);
  }

  validate(raw: unknown): TEvent {
    const name = (raw as { name?: GenericEvent["name"] }).name;
    if (!name) throw new Error(EventValidatorRegistryZodAdapterError.MissingName);

    const schema = this.map.get(name);
    if (!schema) throw new Error(EventValidatorRegistryZodAdapterError.UnknownEvent);

    return schema.parse(raw) as TEvent;
  }
}
