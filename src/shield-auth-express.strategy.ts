import type { RequestHandler } from "express";
import type { AuthSessionReaderPort } from "./auth-session-reader.port";
import { RequestContextExpressAdapter } from "./request-context-express.adapter";
import { ShieldAuthStrategy, ShieldAuthStrategyError } from "./shield-auth.strategy";

type Dependencies<User, Session> = { AuthSessionReader: AuthSessionReaderPort<User, Session> };

declare global {
  namespace Express {
    interface Request {
      user?: unknown;
      session?: unknown;
    }
  }
}

export class ShieldAuthExpressStrategy<User, Session> {
  private readonly strategy: ShieldAuthStrategy<User, Session>;

  constructor(deps: Dependencies<User, Session>) {
    this.strategy = new ShieldAuthStrategy(deps);
  }

  attach: RequestHandler = async (request, _response, next) => {
    const context = new RequestContextExpressAdapter(request);
    const auth = await this.strategy.attach(context);

    request.user = auth.user;
    request.session = auth.session;
    next();
  };

  verify: RequestHandler = (request, response, next) => {
    const user = request.user as User | null;

    if (this.strategy.verify(user)) return next();

    response.status(403).json({ message: ShieldAuthStrategyError.Rejected });
  };

  reverse: RequestHandler = (request, response, next) => {
    const user = request.user as User | null;

    if (this.strategy.reverse(user)) return next();

    response.status(403).json({ message: ShieldAuthStrategyError.Rejected });
  };
}
