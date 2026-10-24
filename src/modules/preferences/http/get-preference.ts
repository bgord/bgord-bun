import type { EndpointPort } from "../../../endpoint.port";
import * as OHQ from "../open-host-queries";
import type * as Ports from "../ports";
import type * as VO from "../value-objects";

type Dependencies<K extends string> = { PreferenceReader: Ports.PreferenceReaderPort<K> };

export const GetPreference =
  <D extends VO.PreferenceDefinitionType>(definition: VO.PreferenceDefinitionValidType<D>, deps: Dependencies<D["key"]>): EndpointPort =>
  async (context) => {
    const userId = context.identity.authenticatedUserId();

    const value = await new OHQ.PreferenceAdapter(definition, deps.PreferenceReader).get(userId);

    return Response.json({ [definition.field]: value });
  };
