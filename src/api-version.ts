import { createMiddleware } from "hono/factory";

export class ApiVersion {
  static HEADER_NAME = "api-version";

  static DEFAULT_API_VERSION = "unknown";

  static attach = createMiddleware(async (c, next) => {
    const build = await bg.BuildInfoRepository.extract();

    c.res.headers.set(ApiVersion.HEADER_NAME, build.BUILD_VERSION ?? ApiVersion.DEFAULT_API_VERSION);

    await next();
  });
}
