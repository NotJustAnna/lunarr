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
import { Configuration } from '@/utils/config';

export class FlixConfig extends Configuration {

  @Type(() => BazarrConfig)
  bazarr: BazarrConfig;

  @Type(() => DiscordConfig)
  discord: DiscordConfig;

  @Type(() => HttpConfig)
  http: HttpConfig;

  @Type(() => JellyfinConfig)
  jellyfin: JellyfinConfig;

  @Type(() => LidarrConfig)
  lidarr: LidarrConfig;

  @Type(() => OmbiConfig)
  ombi: OmbiConfig;

  @Type(() => OverseerrConfig)
  overseerr: OverseerrConfig;

  @Type(() => PlexConfig)
  plex: PlexConfig;

  @Type(() => RadarrConfig)
  radarr: RadarrConfig;

  @Type(() => SonarrConfig)
  sonarr: SonarrConfig;

  @Type(() => WebhooksConfig)
  webhooks: WebhooksConfig;

  constructor() {
    super();
    this.bazarr = new BazarrConfig();
    this.discord = new DiscordConfig();
    this.http = new HttpConfig();
    this.jellyfin = new JellyfinConfig();
    this.lidarr = new LidarrConfig();
    this.ombi = new OmbiConfig();
    this.overseerr = new OverseerrConfig();
    this.plex = new PlexConfig();
    this.radarr = new RadarrConfig();
    this.sonarr = new SonarrConfig();
    this.webhooks = new WebhooksConfig();
  }

  protected register() {
    this.children(
      this.bazarr,
      this.discord,
      this.http,
      this.jellyfin,
      this.lidarr,
      this.ombi,
      this.overseerr,
      this.plex,
      this.radarr,
      this.sonarr,
      this.webhooks,
    );
  }
}
