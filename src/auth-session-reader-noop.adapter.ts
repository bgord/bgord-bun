import type { AuthSessionReaderPort, AuthSessionType } from "../src/auth-session-reader.port";
import type { HasRequestHeaders } from "../src/request-context.port";

export type AuthSessionReaderNoopUserType = { id: string; email: string };
export type AuthSessionReaderNoopSessionType = { id: string };

export class AuthSessionReaderNoopAdapter
  implements AuthSessionReaderPort<AuthSessionReaderNoopUserType, AuthSessionReaderNoopSessionType>
{
  constructor(
    private readonly auth: AuthSessionType<AuthSessionReaderNoopUserType, AuthSessionReaderNoopSessionType>,
  ) {}

  async getSession(_context: HasRequestHeaders) {
    return this.auth;
  }
}
