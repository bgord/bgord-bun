import type * as Events from "../events";
import type * as Ports from "../ports";
import type * as VO from "../value-objects";

export const OnPreferenceSetEventError = { Unknown: "on.preference.set.event.error.unknown" };

export const onPreferenceSetEvent =
  <D extends VO.PreferenceDefinitionType>(
    definitions: ReadonlyArray<VO.PreferenceDefinitionValidType<D>>,
    writer: Ports.PreferenceWriterPort<D["key"]>,
  ) =>
  async (event: Events.PreferenceSetEventType) => {
    const definition = definitions.find((candidate) => candidate.key === event.payload.preference);

    if (!definition) throw new Error(OnPreferenceSetEventError.Unknown);

    await writer.set({
      userId: event.payload.userId,
      key: definition.key,
      value: event.payload.value,
      at: event.createdAt,
    });
  };
