import type { betterAuth } from "better-auth";
import type { AuthSessionReaderPort } from "./auth-session-reader.port";
import type { HasRequestHeaders } from "./request-context.port";

type BetterAuthInstance = ReturnType<typeof betterAuth>;

export class AuthSessionReaderBetterAuthAdapter<TAuth extends BetterAuthInstance>
  implements AuthSessionReaderPort<TAuth["$Infer"]["Session"]["user"], TAuth["$Infer"]["Session"]["session"]>
{
  constructor(private readonly auth: TAuth) {}

  async getSession(context: HasRequestHeaders) {
    const result = await this.auth.api.getSession({ headers: context.request.headers() });

    if (!result) return { user: null, session: null };

    return { user: result.user, session: result.session };
  }
}
