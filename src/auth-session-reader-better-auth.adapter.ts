import type { Auth, BetterAuthOptions } from "better-auth";
import type { AuthSessionReaderPort } from "./auth-session-reader.port";
import type { HasRequestHeaders } from "./request-context.port";

export class AuthSessionReaderBetterAuthAdapter<TOptions extends BetterAuthOptions>
  implements
    AuthSessionReaderPort<
      Auth<TOptions>["$Infer"]["Session"]["user"],
      Auth<TOptions>["$Infer"]["Session"]["session"]
    >
{
  constructor(private readonly auth: Auth<TOptions>) {}

  async getSession(context: HasRequestHeaders) {
    const result = await this.auth.api.getSession({ headers: context.request.headers() });

    if (!result) return { user: null, session: null };
    return { user: result.user, session: result.session };
  }
}
