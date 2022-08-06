import { Service } from 'typedi';
import { RadarrMovie } from '@/types/radarr/api/RadarrMovie';
import { Movie, RadarrDataState } from '@prisma/client';
import { MoviesRepository } from '@/repositories/movies';

@Service()
export class RadarrIntegrationService {
  constructor(private readonly movies: MoviesRepository) {}

  private static readonly whenRadarrImageCoverType: Record<string, keyof Movie> = {
    'poster': 'radarrPosterImage',
    'banner': 'radarrBannerImage',
    'fanart': 'radarrFanartImage',
    'screenshot': 'radarrScreenshotImage',
    'headshot': 'radarrHeadshotImage',
  };

  async syncMovie(external: RadarrMovie) {
    const changes: Partial<Movie> = {
      radarrId: String(external.id),
      tmdbId: (external.tmdbId && external.tmdbId !== 0) ? String(external.tmdbId) : undefined,
      imdbId: (external.imdbId && external.imdbId !== '0') ? external.imdbId : undefined,
      radarrTitle: external.title,
      radarrState: external.monitored ?
        (external.hasFile ? RadarrDataState.AVAILABLE : RadarrDataState.MONITORED)
        : RadarrDataState.UNMONITORED,
    };

    for (let image of external.images) {
      const key = RadarrIntegrationService.whenRadarrImageCoverType[image.coverType];
      if (key) {
        changes[key] = image.remoteUrl as any;
      }
    }

    return this.movies.sync(changes);
  }

  async untrackMovies(allowedExternal: RadarrMovie[]) {
    return this.movies.foreignUntrack(
      'radarrId',
      allowedExternal.map(m => String(m.id)),
      'radarrState',
      null,
    );
  }
}
