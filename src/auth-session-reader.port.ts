import type { HasRequestHeaders } from "./request-context.port";

export interface AuthSessionReader<User, Session> {
  getSession(context: HasRequestHeaders): Promise<{ user: User; session: Session } | null>;
}
