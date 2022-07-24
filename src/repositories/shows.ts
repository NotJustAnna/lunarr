import { createLogger } from '@/common/logger';
import {
  OmbiRequestDataState,
  Prisma,
  PrismaClient,
  Show,
  SonarrDataState,
  SonarrEpisodeDataState,
} from '@/prisma-client';
import { Service } from 'typedi';
import { SonarrSeries } from '@/types/sonarr/api/SonarrSeries';
import { ShowSeasonsRepository } from './showSeasons';
import { TvRequest } from '@/types/ombi/api/GetTvRequests';
import ShowWhereInput = Prisma.ShowWhereInput;

@Service()
export class ShowsRepository {
  private static readonly logger = createLogger('ShowsRepository');

  constructor(
    private readonly client: PrismaClient,
    private readonly showSeasons: ShowSeasonsRepository,
  ) {
  }

  async upsertFromSonarr(externalSeries: SonarrSeries) {
    const sonarrId = String(externalSeries.id);
    const tvdbId = String(externalSeries.tvdbId);
    const tvMazeId = String(externalSeries.tvMazeId);
    const tvRageId = String(externalSeries.tvRageId);

    const show = await this.findUniqueOrMerge({
      OR: [
        { sonarrId },
        ...((externalSeries.tvdbId && externalSeries.tvdbId !== 0) ? [{ tvdbId }] : []),
        ...((externalSeries.tvMazeId && externalSeries.tvMazeId !== 0) ? [{ tvMazeId }] : []),
        ...((externalSeries.tvRageId && externalSeries.tvRageId !== 0) ? [{ tvRageId }] : []),
      ],
    });

    const data: Partial<Show> = {
      sonarrId: sonarrId,
      tvdbId: (externalSeries.tvdbId && externalSeries.tvdbId !== 0) ? tvdbId : null,
      tvMazeId: (externalSeries.tvMazeId && externalSeries.tvMazeId !== 0) ? String(externalSeries.tvMazeId) : null,
      tvRageId: (externalSeries.tvRageId && externalSeries.tvRageId !== 0) ? String(externalSeries.tvRageId) : null,
      title: externalSeries.title,
      sonarrState: externalSeries.monitored ? SonarrDataState.MONITORED : SonarrDataState.UNMONITORED,
    };

    if (!show) {
      return this.client.show.create({
        data: {
          ...data,
          seasons: {
            createMany: {
              data: externalSeries.seasons.map(season => ({
                number: season.seasonNumber,
                sonarrState: season.monitored ? SonarrDataState.MONITORED : SonarrDataState.UNMONITORED,
              })),
            },
          },
        },
      });
    } else {
      await this.client.show.update({ data, where: { id: show.id } });
      await this.showSeasons.batchUpsertFromSonarr(show.id, externalSeries.seasons);
    }

    return show;
  }

  async upsertFromOmbi(externalShow: TvRequest) {
    // TODO
  }

  async ensureOnlySonarrShows(externalSeries: SonarrSeries[]) {
    await this.client.show.updateMany({
      data: {
        sonarrId: null,
        sonarrState: SonarrDataState.NONE,
      },
      where: {
        sonarrId: {
          not: null,
          notIn: externalSeries.map(s => String(s.id)),
        },
        sonarrState: {
          not: SonarrDataState.NONE,
        },
      },
    });

    await this.client.showSeason.updateMany({
      data: { sonarrState: SonarrDataState.NONE },
      where: { show: { sonarrState: SonarrDataState.NONE } },
    });

    await this.client.showEpisode.updateMany({
      data: { sonarrState: SonarrEpisodeDataState.NONE },
      where: { season: { sonarrState: SonarrDataState.NONE } },
    });
  }

  async ensureOnlyOmbiShows(externalShows: TvRequest[]) {
    await this.client.show.updateMany({
      data: {
        ombiRequestId: null,
      },
      where: {
        ombiRequestId: {
          not: null,
          notIn: externalShows.map(s => String(s.id)),
        },
      },
    });

    await this.client.showEpisode.updateMany({
      data: {
        ombiRequestState: OmbiRequestDataState.NONE,
      },
      where: {
        ombiRequestState: {
          not: OmbiRequestDataState.NONE,
        },
        season: { show: { ombiRequestId: null } },
      },
    });
  }

  private async findUniqueOrMerge(where: ShowWhereInput) {
    const shows = await this.client.show.findMany({ where, orderBy: { createdAt: 'asc' } });
    if (shows.length === 0) {
      return null;
    }
    if (shows.length === 1) {
      return shows[0];
    }
    // NOTE: Might be worth debugging why shows got duplicated.
    const data = shows.reduce((show, duplicate) => {
      show.title = duplicate.title || show.title;
      show.jellyfinId = duplicate.jellyfinId || show.jellyfinId;
      show.sonarrId = duplicate.sonarrId || show.sonarrId;
      show.ombiRequestId = duplicate.ombiRequestId || show.ombiRequestId;
      show.tvdbId = duplicate.tvdbId || show.tvdbId;
      show.tvRageId = duplicate.tvRageId || show.tvRageId;
      show.tvMazeId = duplicate.tvMazeId || show.tvMazeId;
      show.jellyfinState = duplicate.jellyfinState || show.jellyfinState;
      show.sonarrState = duplicate.sonarrState || show.sonarrState;
      return show;
    });
    await this.client.$transaction([
      this.client.show.update({ data, where: { id: shows[0].id } }),
      this.client.show.deleteMany({ where: { id: { not: shows[0].id, in: shows.map(m => m.id) } } }),
    ]);
    return data;
  }
}
