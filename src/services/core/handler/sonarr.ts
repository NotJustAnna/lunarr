import { SonarrEpisode } from '../../../types/sonarr/api/SonarrEpisode';
import { createLogger } from '../../../utils/logger';
import { SonarrSeries } from '../../../types/sonarr/api/SonarrSeries';
import { PrismaClient, ShowSeason, SonarrDataState, SonarrEpisodeDataState } from '../../../generated/prisma-client';
import { CorePostOffice } from '../postOffice';
import { SonarrSyncMessage } from '../../../messaging/messages/sync';
import { Result } from '../../../messaging/packet/types';

export class SonarrHandler {
  private static readonly logger = createLogger('SonarrHandler');

  constructor(
    private readonly client: PrismaClient,
    private readonly postOffice: CorePostOffice
  ) {
    this.postOffice.ofType(SonarrSyncMessage, (_, { episodes, series }) => {
      this.sync(series, episodes).catch(error => {
        SonarrHandler.logger.error('Error while syncing Sonarr data', { error });
      });
      return Result.Continue;
    });
  }

  async sync(series: SonarrSeries, episodes: SonarrEpisode[]) {
    const show = await this.createOrUpdateShow(series);
    await this.updateEpisodes(show.id, episodes);
  }

  private async createOrUpdateShow(series: SonarrSeries) {
    const show = await this.client.show.findFirst({
      where: {
        OR: [
          { sonarrId: String(series.id) },
          { tvdbId: String(series.tvdbId) },
          { tvMazeId: String(series.tvMazeId) },
          { tvRageId: String(series.tvRageId) },
        ],
      }
    });

    if (!show) {
      return this.client.show.create({
        data: {
          sonarrId: String(series.id),
          tvdbId: (series.tvdbId && series.tvdbId !== 0) ? String(series.tvdbId) : null,
          tvMazeId: (series.tvMazeId && series.tvMazeId !== 0) ? String(series.tvMazeId) : null,
          tvRageId: (series.tvRageId && series.tvRageId !== 0) ? String(series.tvRageId) : null,
          title: series.title,
          sonarrState: series.monitored ? SonarrDataState.MONITORED : SonarrDataState.UNMONITORED,
          seasons: {
            createMany: {
              data: series.seasons.map(season => ({
                number: season.seasonNumber,
                sonarrState: season.monitored ? SonarrDataState.MONITORED : SonarrDataState.UNMONITORED,
              })),
            }
          }
        }
      });
    }

    // TODO Update show and/or seasons
    return show;
  }

  private async updateEpisodes(showId: string, sonarrEpisodes: SonarrEpisode[]) {
    for (const sonarrEpisode of sonarrEpisodes) {
      const season = await this.getOrCreateStubSeason(showId, sonarrEpisode.seasonNumber);

      const episode = await this.client.showEpisode.findFirst({
        where: {
          seasonId: season.id,
          number: sonarrEpisode.episodeNumber,
        }
      });

      if (!episode) {
        await this.client.showEpisode.create({
          data: {
            seasonId: season.id,
            number: sonarrEpisode.episodeNumber,
            title: sonarrEpisode.title,
            sonarrId: String(sonarrEpisode.id),
            sonarrState: sonarrEpisode.monitored ?
              (sonarrEpisode.hasFile ? SonarrEpisodeDataState.AVAILABLE : SonarrEpisodeDataState.MONITORED)
              : SonarrEpisodeDataState.UNMONITORED,
          }
        });
        continue;
      }

      // TODO Update episode
    }
  }

  private async getOrCreateStubSeason(showId: string, seasonNumber: number): Promise<ShowSeason> {
    const season = await this.client.showSeason.findFirst({
      where: {
        showId,
      }
    });

    if (season) {
      return season;
    }

    return this.client.showSeason.create({
      data: {
        showId,
        number: seasonNumber,
      }
    });
  }
}
