import type * as tools from "@bgord/tools";
import type { ClockPort } from "../../../clock.port";
import { command } from "../../../command-envelope";
import type { EventHandlerStrategy } from "../../../handler.strategy";
import type { IdProviderPort } from "../../../id-provider.port";
import type { CommandBusPort, EventBusPort } from "../../../message-bus.port";
import * as Auth from "../../auth";
import * as Commands from "../commands";

type Dependencies = {
  EventBus: EventBusPort<Auth.Events.AccountCreatedEventType>;
  EventHandler: EventHandlerStrategy;
  IdProvider: IdProviderPort;
  Clock: ClockPort;
  CommandBus: CommandBusPort<Commands.SetUserLanguageCommandType>;
};

export class SetDefaultUserLanguage<L extends ReadonlyArray<tools.LanguageType>> {
  // Stryker disable all
  constructor(
    private readonly systemDefaultLanguage: L[number],
    private readonly deps: Dependencies,
  ) {
    this.deps.EventBus.on(
      Auth.Events.ACCOUNT_CREATED_EVENT,
      this.deps.EventHandler.handle(this.onAccountCreatedEvent.bind(this)),
    );
  }
  // Stryker restore all

  async onAccountCreatedEvent(event: Auth.Events.AccountCreatedEventType) {
    const result = command(
      Commands.SetUserLanguageCommand,
      { payload: { userId: event.payload.userId, language: this.systemDefaultLanguage } },
      this.deps,
    );

    await this.deps.CommandBus.emit(result);
  }
}
