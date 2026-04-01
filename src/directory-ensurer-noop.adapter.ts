import type { DirectoryEnsurerConfig, DirectoryEnsurerPort } from "./directory-ensurer.port";

export class DirectoryEnsurerNoopAdapter implements DirectoryEnsurerPort {
  async ensure(_config: DirectoryEnsurerConfig): Promise<void> {}
}
