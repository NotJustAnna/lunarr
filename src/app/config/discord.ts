import { AbstractConfigurationChild } from '@/utils/config';

export class DiscordConfig extends AbstractConfigurationChild {
  token?: string;

  overrideFromEnv() {
    if (process.env.DISCORD_TOKEN) {
      this.token = process.env.DISCORD_TOKEN;
    }
  }
}
