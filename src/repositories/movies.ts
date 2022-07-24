import { Service } from 'typedi';
import { createLogger } from '@/common/logger';
import { Movie, OmbiRequestDataState, Prisma, PrismaClient, RadarrDataState } from '@/prisma-client';
import { RadarrMovie } from '@/types/radarr/api/RadarrMovie';
import { MovieRequest } from '@/types/ombi/api/GetMovieRequests';
import MovieWhereInput = Prisma.MovieWhereInput;

@Service()
export class MoviesRepository {
  private static readonly logger = createLogger('MoviesRepository');

  constructor(private readonly client: PrismaClient) {
  }

  async upsertFromRadarr(externalMovie: RadarrMovie) {
    const radarrId = String(externalMovie.id);
    const tmdbId = String(externalMovie.tmdbId);

    const movie = await this.findUniqueOrMerge({
      OR: [
        { radarrId },
        ...((externalMovie.tmdbId && externalMovie.tmdbId !== 0) ? [{ tmdbId }] : []),
        ...((externalMovie.imdbId && externalMovie.imdbId !== '0') ? [{ imdbId: externalMovie.imdbId }] : []),
      ],
    });

    const data: Partial<Movie> = {
      radarrId,
      tmdbId: (externalMovie.tmdbId && externalMovie.tmdbId !== 0) ? tmdbId : undefined,
      imdbId: (externalMovie.imdbId && externalMovie.imdbId !== '0') ? externalMovie.imdbId : undefined,
      title: externalMovie.title,
      radarrState: externalMovie.monitored ?
        (externalMovie.hasFile ? RadarrDataState.AVAILABLE : RadarrDataState.MONITORED)
        : RadarrDataState.UNMONITORED,
    };

    if (movie) {
      return this.client.movie.update({ data, where: { id: movie.id } });
    } else {
      return this.client.movie.create({ data });
    }
  }

  async upsertFromOmbi(externalMovie: MovieRequest) {
    const ombiRequestId = String(externalMovie.id);
    const tmdbId = String(externalMovie.theMovieDbId);

    const movie = await this.findUniqueOrMerge({
      OR: [
        { ombiRequestId },
        ...((externalMovie.theMovieDbId && externalMovie.theMovieDbId !== 0) ? [{ tmdbId }] : []),
        ...((externalMovie.imdbId && externalMovie.imdbId !== '0') ? [{ imdbId: externalMovie.imdbId }] : []),
      ],
    });

    const data: Partial<Movie> = {
      ombiRequestId,
      tmdbId: (externalMovie.theMovieDbId && externalMovie.theMovieDbId !== 0) ? tmdbId : null,
      imdbId: (externalMovie.imdbId && externalMovie.imdbId !== '0') ? externalMovie.imdbId : null,
      title: externalMovie.title,
      ombiRequestState: externalMovie.available ? OmbiRequestDataState.AVAILABLE :
        externalMovie.denied ? OmbiRequestDataState.REQUEST_DENIED :
          externalMovie.approved ? OmbiRequestDataState.PROCESSING_REQUEST :
            OmbiRequestDataState.PENDING_APPROVAL,
    };

    if (movie) {
      return this.client.movie.update({ data, where: { id: movie.id } });
    } else {
      return this.client.movie.create({ data });
    }
  }

  async ensureOnlyRadarrMovies(externalMovies: RadarrMovie[]) {
    const { count } = await this.client.movie.updateMany({
      data: {
        radarrId: null,
        radarrState: RadarrDataState.NONE,
      },
      where: {
        radarrId: {
          not: null,
          notIn: externalMovies.map(m => String(m.id)),
        },
        radarrState: {
          not: RadarrDataState.NONE,
        },
      },
    });

    return count;
  }

  async ensureOnlyOmbiMovies(externalMovies: MovieRequest[]) {
    const { count } = await this.client.movie.updateMany({
      data: {
        ombiRequestId: null,
        ombiRequestState: OmbiRequestDataState.NONE,
      },
      where: {
        ombiRequestId: {
          not: null,
          notIn: externalMovies.map(m => String(m.id)),
        },
        radarrState: {
          not: OmbiRequestDataState.NONE,
        },
      },
    });

    return count;
  }

  private async findUniqueOrMerge(where: MovieWhereInput) {
    const movies = await this.client.movie.findMany({ where, orderBy: { createdAt: 'asc' } });
    if (movies.length === 0) {
      return null;
    }
    if (movies.length === 1) {
      return movies[0];
    }
    // NOTE: Might be worth debugging why movies got duplicated.
    const data = movies.reduce((movie, duplicate) => {
      movie.title = duplicate.title || movie.title;
      movie.jellyfinId = duplicate.jellyfinId || movie.jellyfinId;
      movie.radarrId = duplicate.radarrId || movie.radarrId;
      movie.ombiRequestId = duplicate.ombiRequestId || movie.ombiRequestId;
      movie.tmdbId = duplicate.tmdbId || movie.tmdbId;
      movie.imdbId = duplicate.imdbId || movie.imdbId;
      movie.jellyfinState = duplicate.jellyfinState || movie.jellyfinState;
      movie.radarrState = duplicate.radarrState || movie.radarrState;
      movie.ombiRequestState = duplicate.ombiRequestState || movie.ombiRequestState;
      return movie;
    });
    await this.client.$transaction([
      this.client.movie.update({ data, where: { id: movies[0].id } }),
      this.client.movie.deleteMany({ where: { id: { not: movies[0].id, in: movies.map(m => m.id) } } }),
    ]);
    return data;
  }
}
