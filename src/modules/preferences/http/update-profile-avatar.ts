import * as tools from "@bgord/tools";
import * as v from "valibot";
import type { ClockPort } from "../../../clock.port";
import { command } from "../../../command-envelope";
import type { EndpointPort } from "../../../endpoint.port";
import type { IdProviderPort } from "../../../id-provider.port";
import type { CommandBusPort } from "../../../message-bus.port";
import type { TemporaryFilePort } from "../../../temporary-file.port";
import * as Commands from "../commands";

type Dependencies = {
  IdProvider: IdProviderPort;
  Clock: ClockPort;
  CommandBus: CommandBusPort<Commands.UpdateProfileAvatarCommandType>;
  TemporaryFile: TemporaryFilePort;
};

export const UpdateProfileAvatar =
  (deps: Dependencies): EndpointPort =>
  async (context) => {
    const form = await context.request.form();

    const userId = context.identity.authenticatedUserId();
    const file = v.parse(v.instance(File), form.get("file"));

    const extension = v.parse(tools.Extension, file.name.match(/\.([^.]+)$/)?.[1]);
    const filename = tools.Filename.fromParts(userId, extension);

    const temporary = await deps.TemporaryFile.write(filename, file);

    const result = command(
      Commands.UpdateProfileAvatarCommand,
      { payload: { userId, absoluteFilePath: temporary.get() } },
      deps,
    );

    await deps.CommandBus.emit(result);

    return new Response();
  };
