import type { AuthSessionReaderPort, AuthSessionType } from "./auth-session-reader.port";
import type { HasRequestHeaders } from "./request-context.port";

type Dependencies<User, Session> = { AuthSessionReader: AuthSessionReaderPort<User, Session> };

export const ShieldAuthStrategyError = {
  Rejected: "shield.auth.rejected",
  NotAttached: "shield.auth.not.attached",
};

export class ShieldAuthStrategy<User, Session> {
  constructor(private readonly deps: Dependencies<User, Session>) {}

  async attach(context: HasRequestHeaders): Promise<AuthSessionType<User, Session>> {
    return await this.deps.AuthSessionReader.getSession(context);
  }

  verify(user: User | null | undefined): boolean {
    if (user === undefined) throw new Error(ShieldAuthStrategyError.NotAttached);
    return user !== null;
  }

  reverse(user: User | null | undefined): boolean {
    if (user === undefined) throw new Error(ShieldAuthStrategyError.NotAttached);
    return user === null;
  }
}
