import type * as tools from "@bgord/tools";
import type { BuildInfoType } from "../../../build-info.vo";
import type { ClockPort } from "../../../clock.port";
import { event } from "../../../event-envelope";
import type { EventStorePort } from "../../../event-store.port";
import type { IdProviderPort } from "../../../id-provider.port";
import type { Languages } from "../../../languages.vo";
import type { ReactiveConfigPort } from "../../../reactive-config.port";
import type * as Commands from "../commands";
import * as Events from "../events";
import * as Invariants from "../invariants";
import type * as Ports from "../ports";

export const HandleSetUserLanguageCommandError = {
  Missing: "handle.set.user.language.command.error.missing",
};

type Dependencies = {
  EventStore: EventStorePort<AcceptedEvent>;
  IdProvider: IdProviderPort;
  Clock: ClockPort;
  UserLanguageQuery: Ports.UserLanguageQueryPort;
  BuildInfoConfig: ReactiveConfigPort<BuildInfoType>;
};

type AcceptedEvent = Events.UserLanguageSetEventType;

export const handleSetUserLanguageCommand =
  <T extends tools.LanguageType>(languages: Languages<T>, deps: Dependencies) =>
  async (command: Commands.SetUserLanguageCommandType) => {
    const candidate = command.payload.language;

    if (!languages.isSupported(candidate)) throw new Error(HandleSetUserLanguageCommandError.Missing);

    const current = await deps.UserLanguageQuery.get(command.payload.userId);

    if (!Invariants.UserLanguageHasChanged.passes({ current, candidate })) return;

    await deps.EventStore.save([
      await event(
        Events.UserLanguageSetEvent,
        `preferences_${command.payload.userId}`,
        { userId: command.payload.userId, language: candidate },
        deps,
      ),
    ]);
  };
