import { ConfigurationChild } from '@/utils/config';

export class JellyfinConfig extends ConfigurationChild {
  url?: string;
  apiKey?: string;

  overrideFromEnv() {
    if (process.env.JELLYFIN_URL) {
      this.url = process.env.JELLYFIN_URL;
    }
    if (process.env.JELLYFIN_API_KEY) {
      this.apiKey = process.env.JELLYFIN_API_KEY;
    }
  }
}
