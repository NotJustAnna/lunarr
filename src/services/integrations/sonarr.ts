import { Service } from 'typedi';
import { SonarrSeries } from '@/types/sonarr/api/SonarrSeries';
import { SonarrSeason } from '@/types/sonarr/api/SonarrSeason';
import { SonarrEpisode } from '@/types/sonarr/api/SonarrEpisode';
import { Show, ShowEpisode, ShowSeason, SonarrDataState, SonarrEpisodeDataState } from '@prisma/client';
import { ShowsRepository } from '@/repositories/shows';
import { ShowSeasonsRepository } from '@/repositories/showSeasons';
import { ShowEpisodesRepository } from '@/repositories/showEpisodes';

@Service()
export class SonarrIntegrationService {
  constructor(
    private readonly shows: ShowsRepository,
    private readonly showSeasons: ShowSeasonsRepository,
    private readonly showEpisodes: ShowEpisodesRepository,
  ) {}

  private static readonly whenSonarrImageCoverType: Record<string, keyof Show> = {
    'poster': 'sonarrPosterImage',
    'banner': 'sonarrBannerImage',
    'fanart': 'sonarrFanartImage',
    'screenshot': 'sonarrScreenshotImage',
    'headshot': 'sonarrHeadshotImage',
  };

  async syncShow(external: SonarrSeries) {
    const changes: Partial<Show> = {
      sonarrId: String(external.id),
      tvdbId: (external.tvdbId && external.tvdbId !== 0) ? String(external.tvdbId) : null,
      tvMazeId: (external.tvMazeId && external.tvMazeId !== 0) ? String(external.tvMazeId) : null,
      tvRageId: (external.tvRageId && external.tvRageId !== 0) ? String(external.tvRageId) : null,
      sonarrTitle: external.title,
      sonarrOverview: external.overview,
      sonarrState: external.monitored ? SonarrDataState.MONITORED : SonarrDataState.UNMONITORED,
    };

    for (let image of external.images) {
      const key = SonarrIntegrationService.whenSonarrImageCoverType[image.coverType];
      if (key) {
        changes[key] = image.remoteUrl as any;
      }
    }

    return this.shows.sync(changes);
  }

  async syncSeason(showId: Show['id'], external: SonarrSeason) {
    const changes: Partial<ShowSeason> = {
      sonarrState: external.monitored ? SonarrDataState.MONITORED : SonarrDataState.UNMONITORED,
    };

    return this.showSeasons.sync(showId, external.seasonNumber, changes);
  }

  async syncEpisode(seasonId: ShowSeason['id'], external: SonarrEpisode) {
    const changes: Partial<ShowEpisode> = {
      sonarrTitle: external.title,
      sonarrOverview: external.overview,
      sonarrId: String(external.id),
      sonarrState: external.monitored ?
        (external.hasFile ? SonarrEpisodeDataState.AVAILABLE : SonarrEpisodeDataState.MONITORED)
        : SonarrEpisodeDataState.UNMONITORED,
    };

    return this.showEpisodes.sync(seasonId, external.episodeNumber, changes);
  }

  async untrackShows(allowedExternal: SonarrSeries[]) {
    await this.shows.foreignUntrack(
      'sonarrId',
      allowedExternal.map(s => String(s.id)),
      'sonarrState',
      null,
    );
    await this.showSeasons.inheritUntrack(
      'sonarrState', null, 'sonarrState', null,
    );
    await this.showEpisodes.inheritUntrack(
      'sonarrState', null, 'sonarrState', null,
    );
  }

  async untrackSeasons(showId: Show['id'], allowedExternal: SonarrSeason[]) {
    await this.showSeasons.foreignUntrack(
      showId, allowedExternal.map(s => s.seasonNumber), 'sonarrState', null,
    );
    await this.showEpisodes.inheritUntrack(
      'sonarrState', null, 'sonarrState', null,
    );
  }

  async untrackEpisodes(seasonId: ShowSeason['id'], allowedExternal: SonarrEpisode[]) {
    await this.showEpisodes.foreignUntrack(
      seasonId, allowedExternal.map(e => e.episodeNumber), 'sonarrState', null,
    );
  }

  async untrackSeasonsAndEpisodes(
    showId: Show['id'],
    allowedSeasons: { external: SonarrSeason, id: ShowSeason['id'] }[],
    allowedEpisodes: SonarrEpisode[],
  ) {
    const episodesBySeasons = allowedEpisodes.reduce((acc, e) => {
      if (e.seasonNumber in acc) {
        acc[e.seasonNumber].push(e);
      } else {
        acc[e.seasonNumber] = [e];
      }
      return acc;
    }, {} as Record<SonarrEpisode['seasonNumber'], SonarrEpisode[]>);

    await Promise.all(
      allowedSeasons.map(({ external: { seasonNumber }, id }) => {
        return this.untrackEpisodes(id, episodesBySeasons[seasonNumber] || []);
      }),
    );
    await this.untrackSeasons(showId, allowedSeasons.map(s => s.external));
  }
}
