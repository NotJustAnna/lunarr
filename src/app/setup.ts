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
import { constructor } from 'tsyringe/dist/typings/types';
import { container } from 'tsyringe';

export async function setup(constructors: constructor<any>[]) {
  container.registerInstance(NanoflakeLocalGenerator, localGenerator(1653700000000, 0));
  container.registerInstance(PrismaClient, new PrismaClient());
  const config = await Config.loadConfig('config.json');
  config.overrideFromEnv();
  await config.save();
  container.registerInstance(Config, config);
  container.registerInstance(BazarrConfig, config.bazarr);
  container.registerInstance(DiscordConfig, config.discord);
  container.registerInstance(HttpConfig, config.http);
  container.registerInstance(JellyfinConfig, config.jellyfin);
  container.registerInstance(LidarrConfig, config.lidarr);
  container.registerInstance(OmbiConfig, config.ombi);
  container.registerInstance(OverseerrConfig, config.overseerr);
  container.registerInstance(PlexConfig, config.plex);
  container.registerInstance(RadarrConfig, config.radarr);
  container.registerInstance(SonarrConfig, config.sonarr);
  container.registerInstance(WebhooksConfig, config.webhooks);
}
