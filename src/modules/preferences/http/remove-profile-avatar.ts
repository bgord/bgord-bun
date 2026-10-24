import type { ClockPort } from "../../../clock.port";
import { command } from "../../../command-envelope";
import type { EndpointPort } from "../../../endpoint.port";
import type { IdProviderPort } from "../../../id-provider.port";
import type { CommandBusPort } from "../../../message-bus.port";
import * as Commands from "../commands";

type Dependencies = {
  IdProvider: IdProviderPort;
  Clock: ClockPort;
  CommandBus: CommandBusPort<Commands.RemoveProfileAvatarCommandType>;
};

export const RemoveProfileAvatar =
  (deps: Dependencies): EndpointPort =>
  async (context) => {
    const userId = context.identity.authenticatedUserId();

    const result = command(Commands.RemoveProfileAvatarCommand, { payload: { userId } }, deps);

    await deps.CommandBus.emit(result);

    return new Response(null, { status: 202 });
  };
