import type { RequestHandler } from "express";
import { CorrelationIdMiddleware } from "./correlation-id.middleware";
import { CorrelationStorage } from "./correlation-storage.service";
import type { IdProviderPort } from "./id-provider.port";
import type { MiddlewareExpressPort } from "./middleware-express.port";
import { RequestContextExpressAdapter } from "./request-context-express.adapter";
import type { UUIDType } from "./uuid.vo";

type Dependencies = { IdProvider: IdProviderPort };

declare global {
  namespace Express {
    interface Request {
      correlationId: UUIDType;
    }
  }
}

export class CorrelationExpressMiddleware implements MiddlewareExpressPort {
  private readonly correlationId: CorrelationIdMiddleware;

  constructor(deps: Dependencies) {
    this.correlationId = new CorrelationIdMiddleware(deps);
  }

  handle(): RequestHandler {
    return (request, response, next) => {
      const context = new RequestContextExpressAdapter(request);

      const result = this.correlationId.evaluate(context);

      request.correlationId = result;
      response.setHeader(CorrelationIdMiddleware.HEADER_NAME, result);

      CorrelationStorage.run(result, next);
    };
  }
}
