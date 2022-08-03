import { JellyfinConfig } from '@/app/config/jellyfin';
import { OmbiConfig } from '@/app/config/ombi';
import { WebhooksConfig } from '@/app/config/webhooks';
import { BazarrConfig } from '@/app/config/bazarr';
import { DiscordConfig } from '@/app/config/discord';
import { LidarrConfig } from '@/app/config/lidarr';
import { OverseerrConfig } from '@/app/config/overseerr';
import { PlexConfig } from '@/app/config/plex';
import { RadarrConfig } from '@/app/config/radarr';
import { SonarrConfig } from '@/app/config/sonarr';
import { HttpConfig } from './http';
import { AbstractConfiguration } from '@/utils/config';

export class Config extends AbstractConfiguration {
  @Config.Child(() => BazarrConfig)
  bazarr = new BazarrConfig();

  @Config.Child(() => DiscordConfig)
  discord = new DiscordConfig();

  @Config.Child(() => HttpConfig)
  http = new HttpConfig();

  @Config.Child(() => JellyfinConfig)
  jellyfin = new JellyfinConfig();

  @Config.Child(() => LidarrConfig)
  lidarr = new LidarrConfig();

  @Config.Child(() => OmbiConfig)
  ombi = new OmbiConfig();

  @Config.Child(() => OverseerrConfig)
  overseerr = new OverseerrConfig();

  @Config.Child(() => PlexConfig)
  plex = new PlexConfig();

  @Config.Child(() => RadarrConfig)
  radarr = new RadarrConfig();

  @Config.Child(() => SonarrConfig)
  sonarr = new SonarrConfig();

  @Config.Child(() => WebhooksConfig)
  webhooks = new WebhooksConfig();

  static loadConfig(file: string) {
    return AbstractConfiguration.load(Config, file);
  }
}
