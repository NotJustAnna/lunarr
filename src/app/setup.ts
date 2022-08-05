import { Constructable, Container } from 'typedi';
import { localGenerator, NanoflakeLocalGenerator } from 'nanoflakes';
import { PrismaClient } from '@prisma/client';
import { Config } from '@/app/config';
import { BazarrConfig } from '@/app/config/bazarr';
import { DiscordConfig } from '@/app/config/discord';
import { HttpConfig } from '@/app/config/http';
import { JellyfinConfig } from '@/app/config/jellyfin';
import { LidarrConfig } from '@/app/config/lidarr';
import { OmbiConfig } from '@/app/config/ombi';
import { OverseerrConfig } from '@/app/config/overseerr';
import { PlexConfig } from '@/app/config/plex';
import { RadarrConfig } from '@/app/config/radarr';
import { SonarrConfig } from '@/app/config/sonarr';
import { WebhooksConfig } from '@/app/config/webhooks';

export async function setup(constructors: Constructable<any>[]) {
  Container.set(NanoflakeLocalGenerator, localGenerator(1653700000000, 0));
  Container.set(PrismaClient, new PrismaClient());

  const config = await Config.loadConfig('config.json');
  config.overrideFromEnv();
  await config.save();
  Container.set(Config, config);
  Container.set(BazarrConfig, config.bazarr);
  Container.set(DiscordConfig, config.discord);
  Container.set(HttpConfig, config.http);
  Container.set(JellyfinConfig, config.jellyfin);
  Container.set(LidarrConfig, config.lidarr);
  Container.set(OmbiConfig, config.ombi);
  Container.set(OverseerrConfig, config.overseerr);
  Container.set(PlexConfig, config.plex);
  Container.set(RadarrConfig, config.radarr);
  Container.set(SonarrConfig, config.sonarr);
  Container.set(WebhooksConfig, config.webhooks);
}
