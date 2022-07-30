import { ConfigurationChild } from '@/utils/config';

export class RadarrConfig extends ConfigurationChild {
  url?: string;
  apiKey?: string;

  overrideFromEnv() {
    if (process.env.RADARR_URL) {
      this.url = process.env.RADARR_URL;
    }
    if (process.env.RADARR_API_KEY) {
      this.apiKey = process.env.RADARR_API_KEY;
    }
  }
}
