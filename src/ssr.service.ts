import type { NonceProviderPort } from "./nonce-provider.port";
import type { NonceValueType } from "./nonce-value.vo";

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
  constructor(private readonly deps: Dependencies) {}

  get nonce(): NonceValueType {
    return this.deps.NonceProvider.generate();
  }

  secure(nonce: NonceValueType): SSRSecurityHeaders {
    return {
      "Content-Security-Policy": [
        "default-src 'none'",
        "base-uri 'none'",
        "object-src 'none'",
        "frame-ancestors 'none'",
        `script-src 'self' 'nonce-${nonce}'`,
        `script-src-elem 'self' 'nonce-${nonce}'`,
        `style-src 'self' 'nonce-${nonce}'`,
        "style-src-attr 'unsafe-inline'",
        "img-src 'self'",
        "font-src 'self'",
        "connect-src 'self'",
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
