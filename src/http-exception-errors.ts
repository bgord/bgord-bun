import { FileUploaderError } from "./file-uploader.middleware";
import { ShieldApiKeyStrategyError } from "./shield-api-key.strategy";
import { ShieldAuthStrategyError } from "./shield-auth.strategy";
import { ShieldBasicAuthStrategyError } from "./shield-basic-auth.strategy";
import { ShieldBodyLimitError } from "./shield-body-limit.strategy";
import { ShieldCsrfStrategyError } from "./shield-csrf.strategy";
import { ShieldHcaptchaStrategyError } from "./shield-hcaptcha.strategy";
import { ShieldHcaptchaLocalStrategyError } from "./shield-hcaptcha-hono-local.strategy";
import { ShieldIpBlacklistStrategyError } from "./shield-ip-blacklist.strategy";
import { ShieldIpWhitelistStrategyError } from "./shield-ip-whitelist.strategy";
import { ShieldRateLimitStrategyError } from "./shield-rate-limit.strategy";
import { ShieldRecaptchaStrategyError } from "./shield-recaptcha.strategy";
import { ShieldTimeoutStrategyError } from "./shield-timeout.strategy";
import { ShieldWebhookStrategyError } from "./shield-webhook.strategy";

export const HttpExceptionErrors = {
  ShieldApiKeyRejected: ShieldApiKeyStrategyError.Rejected,
  ShieldAuthRejected: ShieldAuthStrategyError.Rejected,
  ShieldBasicAuthRejected: ShieldBasicAuthStrategyError.Rejected,
  ShieldBodyLimitTooBig: ShieldBodyLimitError.TooBig,
  ShieldCsrfRejected: ShieldCsrfStrategyError.Rejected,
  ShieldHcaptchaRejected: ShieldHcaptchaStrategyError.Rejected,
  ShieldHcaptchaLocalRejected: ShieldHcaptchaLocalStrategyError.Rejected,
  ShieldIpBlacklistRejected: ShieldIpBlacklistStrategyError.Rejected,
  ShieldIpWhitelistRejected: ShieldIpWhitelistStrategyError.Rejected,
  ShieldRateLimitRejected: ShieldRateLimitStrategyError.Rejected,
  ShieldRecaptchaRejected: ShieldRecaptchaStrategyError.Rejected,
  ShieldTimeoutRejected: ShieldTimeoutStrategyError.Rejected,
  ShieldWebhookRejected: ShieldWebhookStrategyError.Rejected,
  ...FileUploaderError,
} as const;
