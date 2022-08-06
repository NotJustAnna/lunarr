import { Service } from 'typedi';
import { Movie, OmbiDataState, Show } from '@prisma/client';
import { MovieRequest } from '@/types/ombi/api/GetMovieRequests';
import { MoviesRepository } from '@/repositories/movies';
import { TvRequest } from '@/types/ombi/api/GetTvRequests';
import { ShowsRepository } from '@/repositories/shows';

@Service()
export class OmbiIntegrationService {
  private static readonly imagePrefix = 'http://image.tmdb.org/t/p/original';

  constructor(
    private readonly movies: MoviesRepository,
    private readonly shows: ShowsRepository,
  ) {}

  async syncMovie(external: MovieRequest) {
    const changes: Partial<Movie> = {
      ombiTitle: external.title,
      ombiId: String(external.id),
      tmdbId: (external.theMovieDbId && external.theMovieDbId !== 0) ? String(external.theMovieDbId) : null,
      imdbId: (external.imdbId && external.imdbId !== '0') ? external.imdbId : null,
      ombiState: external.available ? OmbiDataState.AVAILABLE :
        external.denied ? OmbiDataState.DENIED :
          external.approved ? OmbiDataState.PROCESSING :
            OmbiDataState.PENDING_APPROVAL,
      ombiPosterImage: external.posterPath ? `${OmbiIntegrationService.imagePrefix}${external.posterPath}` : null,
      ombiBackgroundImage: external.background ? `${OmbiIntegrationService.imagePrefix}${external.background}` : null,
    };

    return this.movies.sync(changes);
  }

  async syncShow(external: TvRequest) {
    const changes: Partial<Show> = {
      ombiTitle: external.title,
      ombiId: String(external.id),
      tvdbId: (external.tvDbId && external.tvDbId !== 0) ? String(external.tvDbId) : null,
      imdbId: (external.imdbId && external.imdbId !== '0') ? external.imdbId : null,
      ombiPosterImage: external.posterPath ? `${OmbiIntegrationService.imagePrefix}${external.posterPath}` : null,
      ombiBackgroundImage: external.background ? `${OmbiIntegrationService.imagePrefix}${external.background}` : null,
    };

    const shows = await this.shows.sync(changes);

    // TODO Properly understand the chain external.childRequests*.seasonRequests*.episodes
    // then implement the season and episode sync
  }

  async untrackMovies(allowedExternal: MovieRequest[]) {
    return this.movies.foreignUntrack(
      'ombiId',
      allowedExternal.map(m => String(m.id)),
      'ombiState',
      null,
    );
  }

  async untrackShows(allowedExternal: TvRequest[]) {
    // TODO
  }
}
