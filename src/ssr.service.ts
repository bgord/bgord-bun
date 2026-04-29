import type { NonceProviderPort } from "./nonce-provider.port";
import type { NonceValueType } from "./nonce-value.vo";

export type SSRConfig = {
  csp: {
    scriptSources?: ReadonlyArray<string>;
    styleSources?: ReadonlyArray<string>;
    frameSources?: ReadonlyArray<string>;
    connectSources?: ReadonlyArray<string>;
    imgSources?: ReadonlyArray<string>;
  };
};
type Dependencies = { NonceProvider: NonceProviderPort };

export type SSRSecurityHeaders = {
  "Content-Security-Policy": string;
  "Permissions-Policy": string;
  "Cross-Origin-Opener-Policy": string;
  "Cross-Origin-Resource-Policy": string;
  "Referrer-Policy": string;
  "Strict-Transport-Security": string;
  "X-Content-Type-Options": string;
  "X-DNS-Prefetch-Control": string;
  "X-Download-Options": string;
  "X-Permitted-Cross-Domain-Policies": string;
  "X-XSS-Protection": string;
};

export class SSRService {
  constructor(
    private readonly deps: Dependencies,
    private readonly config?: SSRConfig,
  ) {}

  get nonce(): NonceValueType {
    return this.deps.NonceProvider.generate();
  }

  secure(nonce: NonceValueType): SSRSecurityHeaders {
    const scriptSources = ["'self'", `'nonce-${nonce}'`, ...(this.config?.csp.scriptSources ?? [])].join(" ");
    const styleSources = ["'self'", `'nonce-${nonce}'`, ...(this.config?.csp.styleSources ?? [])].join(" ");
    const frameSources = ["'none'", ...(this.config?.csp.frameSources ?? [])].join(" ");
    const connectSources = ["'self'", ...(this.config?.csp.connectSources ?? [])].join(" ");
    const imgSources = ["'self'", ...(this.config?.csp.imgSources ?? [])].join(" ");

    return {
      "Content-Security-Policy": [
        "default-src 'none'",
        "base-uri 'none'",
        "object-src 'none'",
        `frame-src ${frameSources}`,
        "frame-ancestors 'none'",
        `script-src ${scriptSources}`,
        `script-src-elem ${scriptSources}`,
        `style-src ${styleSources}`,
        "style-src-attr 'unsafe-inline'",
        `img-src ${imgSources}`,
        "media-src 'self'",
        "font-src 'self'",
        `connect-src ${connectSources}`,
        "form-action 'self'",
      ].join("; "),
      "Permissions-Policy": [
        "accelerometer=()",
        "autoplay=()",
        "camera=()",
        "fullscreen=(self)",
        "geolocation=()",
        "gyroscope=()",
        "magnetometer=()",
        "microphone=()",
        "payment=()",
        "usb=()",
      ].join(", "),
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Resource-Policy": "same-origin",
      "Referrer-Policy": "no-referrer",
      "Strict-Transport-Security": "max-age=15552000; includeSubDomains",
      "X-Content-Type-Options": "nosniff",
      "X-DNS-Prefetch-Control": "off",
      "X-Download-Options": "noopen",
      "X-Permitted-Cross-Domain-Policies": "none",
      "X-XSS-Protection": "0",
    };
  }
}
