import type { EventStreamEraserPort } from "./event-stream-eraser.port";
import type { UserIdType } from "./modules/auth/value-objects/user-id";

export class EventStreamEraserNoopAdapter implements EventStreamEraserPort {
  async erase(_userId: UserIdType): Promise<void> {}
}
