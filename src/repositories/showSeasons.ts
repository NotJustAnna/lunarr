import { Service } from 'typedi';
import { PrismaClient, Show, ShowSeason, SonarrDataState } from '@/prisma-client';
import { SonarrSeries } from '@/types/sonarr/api/SonarrSeries';
import _ from 'lodash';

@Service()
export class ShowSeasonsRepository {
  constructor(private readonly client: PrismaClient) {
  }

  async batchUpsertFromSonarr(showId: Show['id'], externalSeasons: SonarrSeries['seasons']) {
    // Find all existing seasons currently in the database
    const existingSeasons = await this.client.showSeason.findMany({
      where: { showId, number: { in: externalSeasons.map(season => season.seasonNumber) } },
      select: { number: true },
    }).then(seasons => seasons.map(season => season.number));

    // Group seasons by whether Sonarr is monitoring them or not
    const group = externalSeasons.reduce((acc, season) => {
      if (season.monitored) {
        acc['MONITORED'].push(season.seasonNumber);
      } else {
        acc['UNMONITORED'].push(season.seasonNumber);
      }
      return acc;
    }, { MONITORED: [] as number[], UNMONITORED: [] as number[] } as Record<SonarrDataState, number[]>);

    // This is the cumbersome part.
    await this.client.$transaction([
      // Update the monitoring state of all existing seasons
      ...Object.entries(group).map(([state, seasons]) => this.client.showSeason.updateMany({
        where: { showId, number: { in: _.intersection(existingSeasons, seasons) } },
        data: { sonarrState: state as SonarrDataState },
      })),
      // Create all seasons that are not yet in the database
      this.client.showSeason.createMany({
        data: externalSeasons.filter(season => !existingSeasons.includes(season.seasonNumber)).map(s => ({
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
          number: { notIn: _.intersection(externalSeasons.map(s => s.seasonNumber), existingSeasons) },
        },
        data: { sonarrState: SonarrDataState.NONE },
      }),
    ]);
  }

  async getOrCreateStub(showId: Show['id'], seasonNumber: ShowSeason['number']): Promise<ShowSeason> {
    const season = await this.client.showSeason.findUnique({
      where: {
        showId_number: {
          showId,
          number: seasonNumber,
        },
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
}
