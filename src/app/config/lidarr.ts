import { AbstractConfigurationChild } from '@/utils/config';

export class LidarrConfig extends AbstractConfigurationChild {
  url?: string;
  apiKey?: string;

  overrideFromEnv() {
    if (process.env.LIDARR_URL) {
      this.url = process.env.LIDARR_URL;
    }
    if (process.env.LIDARR_API_KEY) {
      this.apiKey = process.env.LIDARR_API_KEY;
    }
  }
}
