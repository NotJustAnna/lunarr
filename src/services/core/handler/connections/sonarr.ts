import { SonarrEpisode } from '@/types/sonarr/api/SonarrEpisode';
import { createLogger } from '@/common/logger';
import { SonarrSeries } from '@/types/sonarr/api/SonarrSeries';
import { PrismaClient, Show, ShowSeason, SonarrDataState, SonarrEpisodeDataState } from '@/prisma-client';
import { CorePostOffice } from '@/services/core/postOffice';
import { SonarrEpisodesSyncMessage, SonarrSeriesSyncMessage } from '@/common/messaging/messages/sync';
import { Result } from '@/common/messaging/packet/types';
import _ from 'lodash';

export class SonarrHandler {
  private static readonly logger = createLogger('SonarrHandler');

  constructor(
    private readonly client: PrismaClient,
    private readonly postOffice: CorePostOffice,
  ) {
    this.postOffice.ofType(SonarrSeriesSyncMessage, (_, { series }) => {
      this.syncSeries(series).catch(error =>
        SonarrHandler.logger.error('Error while syncing Sonarr data', { error }),
      );
      return Result.Continue;
    });
    this.postOffice.ofType(SonarrEpisodesSyncMessage, (_, { episodes, series }) => {
      this.syncEpisodes(series, episodes).catch(error => {
        SonarrHandler.logger.error('Error while syncing Sonarr data', { error });
      });
      return Result.Continue;
    });
  }

  async syncSeries(series: SonarrSeries[]) {
    await Promise.all(series.map(s => this.createOrUpdateShow(s)));

    // Find all shows that are not in the list and set them to the default state
    const unknownShows = await this.client.show.findMany({
      where: {
        sonarrState: SonarrDataState.MONITORED,
        sonarrId: { notIn: series.map(s => String(s.id)) },
      },
      select: { id: true },
    }).then(shows => shows.map(s => s.id));

    if (unknownShows.length > 0) {
      await Promise.all([
        this.client.show.updateMany({
          data: { sonarrState: SonarrDataState.NONE },
          where: { id: { in: unknownShows } },
        }),
        this.client.showSeason.updateMany({
          data: { sonarrState: SonarrDataState.NONE },
          where: { showId: { in: unknownShows } },
        }),
        this.client.showEpisode.updateMany({
          data: { sonarrState: SonarrEpisodeDataState.NONE },
          where: { season: { showId: { in: unknownShows } } },
        }),
      ]);
    }
  }

  async syncEpisodes(series: SonarrSeries, episodes: SonarrEpisode[]) {
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
      },
    });

    const data: Partial<Show> = {
      sonarrId: String(series.id),
      tvdbId: (series.tvdbId && series.tvdbId !== 0) ? String(series.tvdbId) : null,
      tvMazeId: (series.tvMazeId && series.tvMazeId !== 0) ? String(series.tvMazeId) : null,
      tvRageId: (series.tvRageId && series.tvRageId !== 0) ? String(series.tvRageId) : null,
      title: series.title,
      sonarrState: series.monitored ? SonarrDataState.MONITORED : SonarrDataState.UNMONITORED,
    };

    if (!show) {
      return this.client.show.create({
        data: {
          ...data,
          seasons: {
            createMany: {
              data: series.seasons.map(season => ({
                number: season.seasonNumber,
                sonarrState: season.monitored ? SonarrDataState.MONITORED : SonarrDataState.UNMONITORED,
              })),
            },
          },
        },
      });
    } else {
      await this.client.show.update({ data, where: { id: show.id } });
      await this.updateOrCreateSeasons(show.id, series.seasons);
    }

    return show;
  }

  private async updateEpisodes(showId: string, sonarrEpisodes: SonarrEpisode[]) {
    for (const sonarrEpisode of sonarrEpisodes) {
      const season = await this.getOrCreateStubSeason(showId, sonarrEpisode.seasonNumber);

      const episode = await this.client.showEpisode.findFirst({
        where: {
          seasonId: season.id,
          number: sonarrEpisode.episodeNumber,
        },
      });

      const data = {
        seasonId: season.id,
        number: sonarrEpisode.episodeNumber,
        title: sonarrEpisode.title,
        sonarrId: String(sonarrEpisode.id),
        sonarrState: sonarrEpisode.monitored ?
          (sonarrEpisode.hasFile ? SonarrEpisodeDataState.AVAILABLE : SonarrEpisodeDataState.MONITORED)
          : SonarrEpisodeDataState.UNMONITORED,
      };

      if (episode) {
        await this.client.showEpisode.update({ data, where: { id: episode.id } });
      } else {
        await this.client.showEpisode.create({ data });
      }
    }
  }

  private async getOrCreateStubSeason(showId: string, seasonNumber: number): Promise<ShowSeason> {
    const season = await this.client.showSeason.findFirst({
      where: {
        showId,
        number: seasonNumber,
      },
    });

    if (season) {
      return season;
    }

    return this.client.showSeason.create({
      data: {
        showId,
        number: seasonNumber,
      },
    });
  }

  private async updateOrCreateSeasons(showId: Show['id'], seasons: SonarrSeries['seasons']) {
    // Find all existing seasons currently in the database
    const existingSeasons = await this.client.showSeason.findMany({
      where: { showId, number: { in: seasons.map(season => season.seasonNumber) } },
      select: { number: true },
    }).then(seasons => seasons.map(season => season.number));

    // Group seasons by whether Sonarr is monitoring them or not
    const group = seasons.reduce((acc, season) => {
      if (season.monitored) {
        acc['MONITORED'].push(season.seasonNumber);
      } else {
        acc['UNMONITORED'].push(season.seasonNumber);
      }
      return acc;
    }, { MONITORED: [] as number[], UNMONITORED: [] as number[] } as Record<SonarrDataState, number[]>);

    // This is the cumbersome part.
    await Promise.all([
      // Update the monitoring state of all existing seasons
      ...Object.entries(group).map(([state, seasons]) => this.client.showSeason.updateMany({
        where: { showId, number: { in: _.intersection(existingSeasons, seasons) } },
        data: { sonarrState: state as SonarrDataState },
      })),
      // Create all seasons that are not yet in the database
      this.client.showSeason.createMany({
        data: seasons.filter(season => !existingSeasons.includes(season.seasonNumber)).map(s => ({
          showId,
          number: s.seasonNumber,
          sonarrState: s.monitored ? SonarrDataState.MONITORED : SonarrDataState.UNMONITORED,
        })),
      }),
      // Set all seasons that are no longer in Sonarr to the default state
      this.client.showSeason.updateMany({
        where: {
          showId,
          sonarrState: { not: SonarrDataState.NONE },
          number: { notIn: _.intersection(seasons.map(s => s.seasonNumber), existingSeasons) },
        },
        data: { sonarrState: SonarrDataState.NONE },
      }),
    ]);
  }
}
