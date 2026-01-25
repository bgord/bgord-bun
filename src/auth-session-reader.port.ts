import type { HasRequestHeaders } from "./request-context.port";

export interface AuthSessionReaderPort<User, Session> {
  getSession(
    context: HasRequestHeaders,
  ): Promise<{ user: User; session: Session } | { user: null; session: null }>;
}
