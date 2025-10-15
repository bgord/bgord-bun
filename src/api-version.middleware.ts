import { createMiddleware } from "hono/factory";
import { BuildInfoRepository } from "./build-info-repository.service";
import type { ClockPort } from "./clock.port";

type Dependencies = { Clock: ClockPort };

export class ApiVersion {
  private static readonly HEADER_NAME = "api-version";

  private static readonly DEFAULT_API_VERSION = "unknown";

  static build = (deps: Dependencies) =>
    createMiddleware(async (c, next) => {
      const build = await BuildInfoRepository.extract(deps);

      c.res.headers.set(ApiVersion.HEADER_NAME, build.BUILD_VERSION ?? ApiVersion.DEFAULT_API_VERSION);

      await next();
    });
}
