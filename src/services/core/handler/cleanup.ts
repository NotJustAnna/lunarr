import { createLogger } from '@/common/logger';
import {
  JellyfinDataState,
  PrismaClient,
  RadarrDataState,
  SonarrDataState,
  SonarrEpisodeDataState,
} from '@/prisma-client';

export class CleanupHandler {
  private static readonly logger = createLogger('CleanupHandler');

  constructor(
    private readonly client: PrismaClient,
  ) {
    setInterval(() => {
      this.hourlyCleanup().catch(error => {
        CleanupHandler.logger.error('Error while cleaning up database', { error });
      });
    }, 3600000);
  }

  private async hourlyCleanup() {
    await Promise.all([
      this.client.show.deleteMany({
        where: {
          sonarrState: SonarrDataState.NONE,
          jellyfinState: JellyfinDataState.NONE,
        },
      }),
      this.client.showSeason.deleteMany({
        where: {
          sonarrState: SonarrDataState.NONE,
          jellyfinState: JellyfinDataState.NONE,
        },
      }),
      this.client.showEpisode.deleteMany({
        where: {
          sonarrState: SonarrEpisodeDataState.NONE,
          jellyfinState: JellyfinDataState.NONE,
        },
      }),
      this.client.movie.deleteMany({
        where: {
          radarrState: RadarrDataState.NONE,
          jellyfinState: JellyfinDataState.NONE,
        },
      }),
    ]);
  }
}
