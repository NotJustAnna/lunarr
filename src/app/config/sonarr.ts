import { AbstractConfigurationChild } from '@/utils/config';

export class SonarrConfig extends AbstractConfigurationChild {
  url?: string;
  apiKey?: string;

  overrideFromEnv() {
    if (process.env.SONARR_URL) {
      this.url = process.env.SONARR_URL;
    }
    if (process.env.SONARR_API_KEY) {
      this.apiKey = process.env.SONARR_API_KEY;
    }
  }
}
