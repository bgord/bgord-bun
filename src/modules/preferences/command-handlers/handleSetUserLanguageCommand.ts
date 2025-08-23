import { createEventEnvelope } from "../../../event-envelope";
import type { EventStoreLike } from "../../../event-store-like.types";
import type * as Commands from "../commands";
import * as Events from "../events";
import * as Invariants from "../invariants";
import type * as Ports from "../ports";
import type * as VO from "../value-objects";

type AcceptedEvent = Events.UserLanguageSetEventType;

export const handleSetUserLanguageCommand =
  <L extends readonly string[]>(
    EventStore: EventStoreLike<AcceptedEvent>,
    query: Ports.UserLanguageQueryPort,
    supported: VO.SupportedLanguagesSet<L>,
  ) =>
  async (command: Commands.SetUserLanguageCommandType) => {
    const candidate = supported.ensure(command.payload.language);
    const current = await query.get(command.payload.userId);

    if (Invariants.UserLanguageHasChanged.fails({ current, candidate: command.payload.language })) return;

    const event = Events.UserLanguageSetEvent.parse({
      ...createEventEnvelope(`preferences_${command.payload.userId}`),
      name: Events.USER_LANGUAGE_SET_EVENT,
      payload: { userId: command.payload.userId, language: candidate },
    } satisfies Events.UserLanguageSetEventType);

    await EventStore.save([event]);
  };
