import type { AuthSessionReaderPort } from "../src/auth-session-reader.port";
import type { HasRequestHeaders } from "../src/request-context.port";

export type AuthSessionReaderNoopUserType = { id: string; email: string };
export type AuthSessionReaderNoopSessionType = { id: string };

export class AuthSessionReaderNoopAdapter
  implements AuthSessionReaderPort<AuthSessionReaderNoopUserType, AuthSessionReaderNoopSessionType>
{
  constructor(
    private readonly user: AuthSessionReaderNoopUserType | null,
    private readonly session: AuthSessionReaderNoopSessionType | null,
  ) {}

  async getSession(_context: HasRequestHeaders) {
    return { user: this.user, session: this.session };
  }
}
