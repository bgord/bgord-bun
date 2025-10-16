import { createMiddleware } from "hono/factory";
import { BuildInfoRepository } from "./build-info-repository.service";
import type { ClockPort } from "./clock.port";
import type { JsonFileReaderPort } from "./json-file-reader.port";

type Dependencies = { Clock: ClockPort; JsonFileReader: JsonFileReaderPort };

export class ApiVersion {
  static readonly HEADER_NAME = "api-version";
  static readonly DEFAULT_API_VERSION = "unknown";

  static build = (deps: Dependencies) =>
    createMiddleware(async (c, next) => {
      const build = await BuildInfoRepository.extract(deps);
      c.res.headers.set(ApiVersion.HEADER_NAME, build.BUILD_VERSION ?? ApiVersion.DEFAULT_API_VERSION);
      await next();
    });
}
