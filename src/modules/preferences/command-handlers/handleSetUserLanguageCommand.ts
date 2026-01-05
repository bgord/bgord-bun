import type * as tools from "@bgord/tools";
import type { ClockPort } from "../../../clock.port";
import { createEventEnvelope } from "../../../event-envelope";
import type { EventStoreLike } from "../../../event-store-like.types";
import type { IdProviderPort } from "../../../id-provider.port";
import type * as Commands from "../commands";
import * as Events from "../events";
import * as Invariants from "../invariants";
import type * as Ports from "../ports";
import type * as VO from "../value-objects";

type Dependencies = {
  EventStore: EventStoreLike<AcceptedEvent>;
  IdProvider: IdProviderPort;
  Clock: ClockPort;
  UserLanguageQuery: Ports.UserLanguageQueryPort;
};

type AcceptedEvent = Events.UserLanguageSetEventType;

export const handleSetUserLanguageCommand =
  <L extends readonly tools.LanguageType[]>(supported: VO.SupportedLanguagesSet<L>, deps: Dependencies) =>
  async (command: Commands.SetUserLanguageCommandType) => {
    const candidate = supported.ensure(command.payload.language);
    const current = await deps.UserLanguageQuery.get(command.payload.userId);

    if (!Invariants.UserLanguageHasChanged.passes({ current, candidate: command.payload.language })) return;

    const event = Events.UserLanguageSetEvent.parse({
      ...createEventEnvelope(`preferences_${command.payload.userId}`, deps),
      name: Events.USER_LANGUAGE_SET_EVENT,
      payload: { userId: command.payload.userId, language: candidate },
    } satisfies Events.UserLanguageSetEventType);

    await deps.EventStore.save([event]);
  };
