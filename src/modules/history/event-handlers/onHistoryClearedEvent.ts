import * as Events from "../events";
import * as Repos from "../repositories";

export const onHistoryClearedEvent =
  (repository: Repos.HistoryRepositoryPort) => async (event: Events.HistoryClearedEventType) => {
    await repository.clear(event.payload.subject);
  };
