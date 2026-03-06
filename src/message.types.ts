export type Message = { name: string };

export type ToMessageMap<Definition extends Message> = {
  [M in Definition as M["name"]]: M;
};
