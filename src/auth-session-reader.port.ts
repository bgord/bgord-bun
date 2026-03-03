import type { HasRequestHeaders } from "./request-context.port";

export type AuthSessionType<User, Session> = { user: User; session: Session } | { user: null; session: null };

export interface AuthSessionReaderPort<User, Session> {
  getSession(context: HasRequestHeaders): Promise<AuthSessionType<User, Session>>;
}
