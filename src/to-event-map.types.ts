export type ToEventMap<E extends { name: string }> = {
  [Ev in E as Ev["name"]]: Ev;
};
