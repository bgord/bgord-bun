import type { betterAuth } from "better-auth";
import type { AuthSessionReaderPort } from "./auth-session-reader.port";
import type { HasRequestHeaders } from "./request-context.port";

type BetterAuthUserType = ReturnType<typeof betterAuth>["$Infer"]["Session"]["user"];
type BetterAuthSessionType = ReturnType<typeof betterAuth>["$Infer"]["Session"]["session"];

export class AuthSessionReaderBetterAuthAdapter
  implements AuthSessionReaderPort<BetterAuthUserType, BetterAuthSessionType>
{
  constructor(private readonly auth: ReturnType<typeof betterAuth>) {}

  async getSession(context: HasRequestHeaders) {
    const result = await this.auth.api.getSession({ headers: context.request.headers() });

    if (!result) return { user: null, session: null };
    return { user: result.user, session: result.session };
  }
}
