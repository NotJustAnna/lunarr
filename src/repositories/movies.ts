import { Service } from 'typedi';
import { createLogger } from '@/app/logger';
import { Movie, Prisma, PrismaClient } from '@prisma/client';
import { ChangeSetService } from '@/services/events/changeSet';
import { performance } from 'perf_hooks';
import MovieWhereInput = Prisma.MovieWhereInput;

@Service()
export class MoviesRepository {
  private static readonly logger = createLogger('MoviesRepository');

  constructor(
    private readonly client: PrismaClient,
    private readonly events: ChangeSetService,
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
    return this.client.$transaction(async (client) => {
      const movies = await client.movie.findMany({
        where: MoviesRepository.fromChanges(changes),
        orderBy: { createdAt: 'asc' },
      });
      if (movies.length === 0) {
        const newMovie = await client.movie.create({ data: changes });
        this.events.fromNewMovie(newMovie);
        return newMovie;
      } else if (movies.length === 1) {
        const updatedMovie = await client.movie.update({ data: changes, where: { id: movies[0].id } });
        this.events.fromMovieChanges(movies[0], changes);
        return updatedMovie;
      } else {
        MoviesRepository.logger.debug('Found multiple movies matching a single sync(), merging...');
        const start = performance.now();
        // NOTE: Might be worth debugging why movies got duplicated.
        const merged = movies.reduce((movie, duplicate) => {
          // movie.title = duplicate.title || movie.title;
          movie.jellyfinTitle = duplicate.jellyfinTitle || movie.jellyfinTitle;
          movie.radarrTitle = duplicate.radarrTitle || movie.radarrTitle;
          movie.ombiRequestTitle = duplicate.ombiRequestTitle || movie.ombiRequestTitle;
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
        const { id, ...mergedChanges } = merged;
        const mergedMovies = movies.slice(1).map(m => m.id);
        await client.movie.deleteMany({ where: { id: { in: mergedMovies } } });
        const updatedMovie = await client.movie.update({ data: { ...mergedChanges, ...changes }, where: { id } });
        this.events.fromMovieChanges(merged, changes);
        MoviesRepository.logger.debug(`Merged ${movies.length} movies in ${performance.now() - start}ms`);
        return updatedMovie;
      }
    }, { maxWait: 5000 });
  }

  async foreignUntrack<Key extends keyof Movie, State extends keyof Movie>(
    foreignKey: Key, allowedKeys: MovieWhereInput[Key][],
    stateKey: State, allowedState: MovieWhereInput[State],
  ) {
    await this.client.$transaction<void>(async (client) => {
      const movies = await client.movie.findMany({
        where: {
          [foreignKey]: { not: null, notIn: allowedKeys },
          [stateKey]: { not: allowedState },
        },
      });

      if (movies.length > 0) {
        await client.movie.updateMany({
          data: { [foreignKey]: null, [stateKey]: allowedState },
          where: { id: { in: movies.map(m => m.id) } },
        });
        await Promise.all(
          movies.map(
            m => this.events.fromMovieChanges(m, { [foreignKey]: null, [stateKey]: allowedState }),
          ),
        );
      }
    }, { maxWait: 5000 });
  }

  async deleteUntracked() {
    return this.client.movie.deleteMany({
      where: {
        radarrState: null,
        jellyfinState: null,
      },
    });
  }
}
