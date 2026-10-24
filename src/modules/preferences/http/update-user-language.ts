import * as tools from "@bgord/tools";
import * as v from "valibot";
import type { ClockPort } from "../../../clock.port";
import { command } from "../../../command-envelope";
import type { EndpointPort } from "../../../endpoint.port";
import type { IdProviderPort } from "../../../id-provider.port";
import type { CommandBusPort } from "../../../message-bus.port";
import * as Commands from "../commands";

type Dependencies = {
  IdProvider: IdProviderPort;
  Clock: ClockPort;
  CommandBus: CommandBusPort<Commands.SetUserLanguageCommandType>;
};

export const UpdateUserLanguage =
  (deps: Dependencies): EndpointPort =>
  async (context) => {
    const body = await context.request.json();

    const userId = context.identity.authenticatedUserId();
    const language = v.parse(tools.Language, body["language"]);

    const result = command(Commands.SetUserLanguageCommand, { payload: { userId, language } }, deps);

    await deps.CommandBus.emit(result);

    return new Response();
  };
