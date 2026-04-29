import type { NonceProviderPort } from "./nonce-provider.port";
import type { NonceValueType } from "./nonce-value.vo";
import { type SSRConfig, SSRService } from "./ssr.service";

type Dependencies = { NonceProvider: NonceProviderPort };

export class SSRBun {
  static essentials(
    handler: (request: Request, nonce: NonceValueType) => Promise<Response>,
    deps: Dependencies,
    config?: SSRConfig,
  ) {
    const service = new SSRService(deps, config);

    return async (request: Request): Promise<Response> => {
      const nonce = service.nonce;

      const response = await handler(request, nonce);

      const headers = service.secure(nonce);
      Object.entries(headers).forEach(([name, value]) => response.headers.set(name, value));

      return response;
    };
  }
}
