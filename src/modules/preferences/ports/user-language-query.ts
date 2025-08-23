export interface UserLanguageQueryPort {
  // TODO
  get(userId: string): Promise<string | null>;
}
