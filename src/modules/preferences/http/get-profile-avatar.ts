import { CacheFileMustRevalidate } from "../../../cache-file.service";
import type { EndpointPort } from "../../../endpoint.port";
import { Hash } from "../../../hash.vo";
import type { RemoteFileStoragePort } from "../../../remote-file-storage.port";
import type * as VO from "../value-objects";

type Dependencies = { RemoteFileStorage: RemoteFileStoragePort };

export const GetProfileAvatar =
  (ProfileAvatar: VO.ProfileAvatarType, deps: Dependencies): EndpointPort =>
  async (context) => {
    const headers = context.request.headers();

    const userId = context.identity.authenticatedUserId();

    const key = ProfileAvatar.key(userId);

    const head = await deps.RemoteFileStorage.head(key);
    if (!head.exists) return new Response(null, { status: 404 });

    const ifNoneMatchHeader = headers.get("if-none-match");

    if (ifNoneMatchHeader && Hash.fromString(ifNoneMatchHeader).matches(head.etag)) {
      return CacheFileMustRevalidate.notModified(head);
    }

    const stream = await deps.RemoteFileStorage.getStream(key);
    if (!stream) return new Response(null, { status: 404 });

    return new Response(stream, { headers: CacheFileMustRevalidate.fresh(head) });
  };
