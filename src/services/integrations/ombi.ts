import { Service } from 'typedi';
import { Movie, OmbiRequestDataState } from '@/prisma-client';
import { MovieRequest } from '@/types/ombi/api/GetMovieRequests';
import { MoviesRepository } from '@/repositories/movies';
import { TvRequest } from '@/types/ombi/api/GetTvRequests';

@Service()
export class OmbiIntegrationService {
  constructor(private readonly movies: MoviesRepository) {}

  async syncMovie(external: MovieRequest) {
    const changes: Partial<Movie> = {
      ombiRequestId: String(external.id),
      tmdbId: (external.theMovieDbId && external.theMovieDbId !== 0) ? String(external.theMovieDbId) : null,
      imdbId: (external.imdbId && external.imdbId !== '0') ? external.imdbId : null,
      title: external.title,
      ombiRequestState: external.available ? OmbiRequestDataState.AVAILABLE :
        external.denied ? OmbiRequestDataState.REQUEST_DENIED :
          external.approved ? OmbiRequestDataState.PROCESSING_REQUEST :
            OmbiRequestDataState.PENDING_APPROVAL,
    };

    return this.movies.sync(changes);
  }

  async syncShow(external: TvRequest) {

  }

  async untrackMovies(allowedExternal: MovieRequest[]) {
    return this.movies.foreignUntrack(
      'ombiRequestId',
      allowedExternal.map(m => String(m.id)),
      'ombiRequestState',
      OmbiRequestDataState.NONE,
    );
  }

  async untrackShows(allowedExternal: TvRequest[]) {

  }
}
