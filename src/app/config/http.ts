import { ConfigurationChild } from '@/utils/config';

export class HttpConfig extends ConfigurationChild {
  port: number = 4000;

  overrideFromEnv() {
    if (process.env.HTTP_PORT) {
      this.port = parseInt(process.env.HTTP_PORT, 10);
    }
  }
}
