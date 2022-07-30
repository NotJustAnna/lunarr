import { ConfigurationChild } from '@/utils/config';

export class DiscordConfig extends ConfigurationChild {
  token?: string;

  overrideFromEnv() {
    if (process.env.DISCORD_TOKEN) {
      this.token = process.env.DISCORD_TOKEN;
    }
  }
}
