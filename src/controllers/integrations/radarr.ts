import { Service } from 'typedi';
import { createLogger } from '@/common/logger';
import { Movie, PrismaClient, RadarrDataState } from '@/prisma-client';
import { RadarrMovie } from '@/types/radarr/api/RadarrMovie';
import process from 'process';
import { ExitCode } from '@/common/utils/exitCode';
import { attempt } from '@/common/utils/attempt';
import axios from 'axios';

@Service()
export class RadarrIntegration {

  private static readonly logger = createLogger('RadarrIntegration');

  constructor(
    private readonly client: PrismaClient,
  ) {
  }

  async sync(movies: RadarrMovie[]) {
    await Promise.all(movies.map(this.createOrUpdateMovie.bind(this)));
    await this.findAndUpdateOldMovies(movies);
  }

  private async syncTask() {

    const logger = createLogger('Task "Sync Radarr"');

    const url = process.env.RADARR_URL!;
    if (!url) {
      logger.error('RADARR_URL environment variable is not set!');
      process.exit(ExitCode.CONFIGURATION_ERROR);
    }
    const apiKey = process.env.RADARR_API_KEY!;
    if (!apiKey) {
      logger.error('RADARR_API_KEY environment variable is not set!');
      process.exit(ExitCode.CONFIGURATION_ERROR);
    }

    logger.info('Syncing Movies...');

    const moviesResponse = await attempt(3, () => {
      return axios.get<RadarrMovie[]>(`${url}/api/v3/movie`, {
        headers: {
          'X-Api-key': apiKey,
        },
      });
    });

    const movies = moviesResponse.data;
    logger.info(`Radarr sync complete! Found ${movies.length} movies.`);
    await this.sync(movies);
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
      RadarrIntegration.logger.info(`Found and updated ${count} movies that are not in the Radarr database`);
    }
  }
}
