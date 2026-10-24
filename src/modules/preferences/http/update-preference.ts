import type { ClockPort } from "../../../clock.port";
import { command } from "../../../command-envelope";
import type { EndpointPort } from "../../../endpoint.port";
import type { IdProviderPort } from "../../../id-provider.port";
import type { CommandBusPort } from "../../../message-bus.port";
import { StandardSchemaValidator } from "../../../standard-schema-validator.service";
import * as Commands from "../commands";
import type * as VO from "../value-objects";

type Dependencies = {
  IdProvider: IdProviderPort;
  Clock: ClockPort;
  CommandBus: CommandBusPort<Commands.SetPreferenceCommandType>;
};

export const UpdatePreference =
  <D extends VO.PreferenceDefinitionType>(definition: VO.PreferenceDefinitionValidType<D>, deps: Dependencies): EndpointPort =>
  async (context) => {
    const body = await context.request.json();

    const userId = context.identity.authenticatedUserId();
    const value = StandardSchemaValidator.validate(definition.schema, body[definition.field]);

    const result = command(
      Commands.SetPreferenceCommand,
      { payload: { userId, preference: definition.key, value } },
      deps,
    );

    await deps.CommandBus.emit(result);

    return new Response();
  };
