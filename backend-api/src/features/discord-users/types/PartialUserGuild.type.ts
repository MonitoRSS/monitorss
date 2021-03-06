export interface PartialUserGuild {
  id: string;
  name: string;
  icon?: string;
  owner: boolean;
  permissions: string;
}

export type PartialUserGuildFormatted = PartialUserGuild & {
  iconUrl?: string;
  benefits: {
    maxFeeds: number;
    webhooks: boolean;
  };
};
