import { AbstractConfigurationChild } from '@/utils/config';

export class OmbiConfig extends AbstractConfigurationChild {
  url?: string;
  apiKey?: string;

  overrideFromEnv() {
    if (process.env.OMBI_URL) {
      this.url = process.env.OMBI_URL;
    }
    if (process.env.OMBI_API_KEY) {
      this.apiKey = process.env.OMBI_API_KEY;
    }
  }
}
