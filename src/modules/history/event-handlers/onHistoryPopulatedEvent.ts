import * as Events from "../events";
import * as Repos from "../repositories";
import * as VO from "../value-objects";

export const onHistoryPopulatedEvent =
  (repository: Repos.HistoryRepositoryPort) => async (event: Events.HistoryPopulatedEventType) => {
    const data = VO.HistoryParsed.parse(event.payload);
    await repository.append(data, event.createdAt);
  };
