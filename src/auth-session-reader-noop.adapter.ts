import type { AuthSessionReaderPort } from "../src/auth-session-reader.port";
import type { HasRequestHeaders } from "../src/request-context.port";

export type AuthSessionReaderNoopUserType = { id: string; email: string };
export type AuthSessionReaderNoopSessionType = { id: string };

export class AuthSessionReaderNoopAdapter
  implements AuthSessionReaderPort<AuthSessionReaderNoopUserType, AuthSessionReaderNoopSessionType>
{
  constructor(
    private readonly auth:
      | { user: AuthSessionReaderNoopUserType; session: AuthSessionReaderNoopSessionType }
      | { user: null; session: null },
  ) {}

  async getSession(_context: HasRequestHeaders) {
    return this.auth;
  }
}
