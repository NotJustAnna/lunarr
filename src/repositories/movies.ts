import { Service } from 'typedi';
import { createLogger } from '@/common/logger';
import { Movie, Prisma, PrismaClient } from '@/prisma-client';
import { EventEmitterService } from '@/services/eventEmitter';
import MovieWhereInput = Prisma.MovieWhereInput;

@Service()
export class MoviesRepository {
  private static readonly logger = createLogger('MoviesRepository');

  constructor(
    private readonly client: PrismaClient,
    private readonly events: EventEmitterService,
  ) {
  }

  private static fromChanges(changes: Partial<Movie>): MovieWhereInput {
    const finders: MovieWhereInput[] = [];
    if (changes.jellyfinId) {
      finders.push({ jellyfinId: changes.jellyfinId });
    }
    if (changes.radarrId) {
      finders.push({ radarrId: changes.radarrId });
    }
    if (changes.ombiRequestId) {
      finders.push({ ombiRequestId: changes.ombiRequestId });
    }
    if (changes.tmdbId) {
      finders.push({ tmdbId: changes.tmdbId });
    }
    if (changes.imdbId) {
      finders.push({ imdbId: changes.imdbId });
    }
    return { OR: finders };
  }

  async sync(changes: Partial<Movie>) {
    const movie = await this.findUniqueOrMerge(MoviesRepository.fromChanges(changes));
    if (movie) {
      const updatedMovie = await this.client.movie.update({ data: changes, where: { id: movie.id } });
      await this.events.fromMovieChanges(movie, changes);
      return updatedMovie;
    } else {
      const newMovie = await this.client.movie.create({ data: changes });
      await this.events.fromNewMovie(newMovie);
      return newMovie;
    }
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

  async foreignUntrack<Key extends keyof Movie, State extends keyof Movie>(
    foreignKey: Key, allowedKeys: MovieWhereInput[Key][],
    stateKey: State, allowedState: MovieWhereInput[State],
  ) {
    const movies = await this.client.movie.findMany({
      where: {
        [foreignKey]: { not: null, notIn: allowedKeys },
        [stateKey]: { not: allowedState },
      },
    });

    if (movies.length > 0) {
      await this.client.movie.updateMany({
        data: { [foreignKey]: null, [stateKey]: allowedState },
        where: { id: { in: movies.map(m => m.id) } },
      });
      await Promise.all(
        movies.map(
          m => this.events.fromMovieChanges(m, { [foreignKey]: null, [stateKey]: allowedState }),
        ),
      );
    }
  }
}
