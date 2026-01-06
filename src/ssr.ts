import { secureHeaders } from "hono/secure-headers";
import type { NonceProviderPort } from "./nonce-provider.port";
import type { NonceValueType } from "./nonce-value.vo";

const noop = async () => {};

type Dependencies = { NonceProvider: NonceProviderPort };

export class SSR {
  static essentials(
    handler: (request: Request, nonce: NonceValueType) => Promise<Response>,
    deps: Dependencies,
  ) {
    return async (request: Request): Promise<Response> => {
      const nonce = deps.NonceProvider.generate();

      const response = await handler(request, nonce);

      secureHeaders({
        crossOriginResourcePolicy: "same-origin",
        contentSecurityPolicy: {
          defaultSrc: ["'none'"],
          baseUri: ["'none'"],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"],

          scriptSrc: ["'self'", `'nonce-${nonce}'`],
          scriptSrcElem: ["'self'", `'nonce-${nonce}'`],

          styleSrc: ["'self'", `'nonce-${nonce}'`],
          styleSrcAttr: ["'unsafe-inline'"],

          imgSrc: ["'self'"],
          fontSrc: ["'self'"],
          connectSrc: ["'self'"],
          formAction: ["'self'"],
        },
        permissionsPolicy: {
          accelerometer: [],
          autoplay: [],
          camera: [],
          fullscreen: ["self"],
          geolocation: [],
          gyroscope: [],
          magnetometer: [],
          microphone: [],
          payment: [],
          usb: [],
        },
        xFrameOptions: false,
        originAgentCluster: false,
      })({ req: request, res: response } as any, noop);

      return response;
    };
  }
}
