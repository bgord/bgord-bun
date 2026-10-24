import type { ClockPort } from "../../../clock.port";
import type { CommitShaValueType } from "../../../commit-sha-value.vo";
import { event } from "../../../event-envelope";
import type { EventStorePort } from "../../../event-store.port";
import type { IdProviderPort } from "../../../id-provider.port";
import { StandardSchemaValidator } from "../../../standard-schema-validator.service";
import type { StaticConfigPort } from "../../../static-config.port";
import type * as Commands from "../commands";
import * as Events from "../events";
import * as Invariants from "../invariants";
import type * as Ports from "../ports";
import type * as VO from "../value-objects";

export const HandleSetPreferenceCommandError = { Unknown: "handle.set.preference.command.error.unknown" };

type Dependencies<K extends string> = {
  EventStore: EventStorePort<AcceptedEvent>;
  IdProvider: IdProviderPort;
  Clock: ClockPort;
  CommitConfig: StaticConfigPort<CommitShaValueType>;
  PreferenceReader: Ports.PreferenceReaderPort<K>;
};

type AcceptedEvent = Events.PreferenceSetEventType;

export const handleSetPreferenceCommand =
  <D extends VO.PreferenceDefinitionType>(definitions: ReadonlyArray<VO.PreferenceDefinitionValidType<D>>, deps: Dependencies<D["key"]>) =>
  async (command: Commands.SetPreferenceCommandType) => {
    const definition = definitions.find((candidate) => candidate.key === command.payload.preference);

    if (!definition) throw new Error(HandleSetPreferenceCommandError.Unknown);

    const candidate = StandardSchemaValidator.validate(definition.schema, command.payload.value);
    const stored = await deps.PreferenceReader.get(command.payload.userId, definition.key);
    const current = stored ?? definition.default;

    if (!Invariants.PreferenceHasChanged.passes({ current, candidate })) return;

    await deps.EventStore.save([
      event(
        Events.PreferenceSetEvent,
        `preferences_${command.payload.userId}`,
        { userId: command.payload.userId, preference: definition.key, value: candidate },
        deps,
      ),
    ]);
  };
