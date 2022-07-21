import { createLogger } from '../../../../utils/logger';
import { RadarrMovie } from '../../../../types/radarr/api/RadarrMovie';
import { Movie, PrismaClient, RadarrDataState } from '../../../../generated/prisma-client';
import { CorePostOffice } from '../../postOffice';
import { RadarrSyncMessage } from '../../../../messaging/messages/sync';
import { Result } from '../../../../messaging/packet/types';

export class RadarrHandler {
  private static readonly logger = createLogger('RadarrHandler');

  constructor(
    private readonly client: PrismaClient,
    private readonly postOffice: CorePostOffice,
  ) {
    this.postOffice.ofType(RadarrSyncMessage, (_, { movies }) => {
      this.sync(movies).catch(error => {
        RadarrHandler.logger.error('Error while syncing Radarr data', { error });
      });
      return Result.Continue;
    });
  }

  async sync(movies: RadarrMovie[]) {
    await Promise.all(movies.map(this.createOrUpdateMovie.bind(this)));
    await this.findAndUpdateOldMovies(movies);
  }

  private async createOrUpdateMovie(m: RadarrMovie) {
    const movie = await this.client.movie.findFirst({
      where: {
        OR: [
          { radarrId: String(m.id) },
          { tmdbId: String(m.tmdbId) },
          { imdbId: m.imdbId },
        ],
      },
    });

    const data: Partial<Movie> = {
      radarrId: String(m.id),
      tmdbId: (m.tmdbId && m.tmdbId !== 0) ? String(m.tmdbId) : null,
      imdbId: (m.imdbId && m.imdbId !== '0') ? m.imdbId : null,
      title: m.title,
      radarrState: m.monitored ?
        (m.hasFile ? RadarrDataState.AVAILABLE : RadarrDataState.MONITORED)
        : RadarrDataState.UNMONITORED,
    };

    if (movie) {
      await this.client.movie.update({ data, where: { id: movie.id } });
    } else {
      await this.client.movie.create({ data });
    }
  }

  private async findAndUpdateOldMovies(m: RadarrMovie[]) {
    const { count } = await this.client.movie.updateMany({
      data: {
        radarrId: null,
        radarrState: RadarrDataState.NONE,
      },
      where: {
        OR: [
          {
            AND: [
              { radarrId: { not: null } },
              { radarrId: { notIn: m.map(m => String(m.id)) } },
            ],
          },
          {
            radarrState: { not: RadarrDataState.NONE },
          },
        ],
      },
    });

    if (count > 0) {
      RadarrHandler.logger.info(`Found and updated ${count} movies that are not in the Radarr database`);
    }
  }
}
