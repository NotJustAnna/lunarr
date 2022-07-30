import { ConfigurationChild } from '@/utils/config';

export class BazarrConfig extends ConfigurationChild {
  url?: string;
  apiKey?: string;

  overrideFromEnv() {
    if (process.env.BAZARR_URL) {
      this.url = process.env.BAZARR_URL;
    }
    if (process.env.BAZARR_API_KEY) {
      this.apiKey = process.env.BAZARR_API_KEY;
    }
  }
}
