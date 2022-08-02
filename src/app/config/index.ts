import { Type } from 'class-transformer';
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
  @Config.Child()
  @Type(() => BazarrConfig)
  bazarr = new BazarrConfig();

  @Config.Child()
  @Type(() => DiscordConfig)
  discord = new DiscordConfig();

  @Config.Child()
  @Type(() => HttpConfig)
  http = new HttpConfig();

  @Config.Child()
  @Type(() => JellyfinConfig)
  jellyfin = new JellyfinConfig();

  @Config.Child()
  @Type(() => LidarrConfig)
  lidarr = new LidarrConfig();

  @Config.Child()
  @Type(() => OmbiConfig)
  ombi = new OmbiConfig();

  @Config.Child()
  @Type(() => OverseerrConfig)
  overseerr = new OverseerrConfig();

  @Config.Child()
  @Type(() => PlexConfig)
  plex = new PlexConfig();

  @Config.Child()
  @Type(() => RadarrConfig)
  radarr = new RadarrConfig();

  @Config.Child()
  @Type(() => SonarrConfig)
  sonarr = new SonarrConfig();

  @Config.Child()
  @Type(() => WebhooksConfig)
  webhooks = new WebhooksConfig();

  static loadConfig(file: string) {
    return AbstractConfiguration.load(Config, file);
  }
}
