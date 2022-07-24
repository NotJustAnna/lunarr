import { Service } from 'typedi';
import { TvRequest } from '@/types/ombi/api/GetTvRequests';
import { createLogger } from '@/common/logger';
import { Movie, OmbiRequestDataState, PrismaClient } from '@/prisma-client';
import { MovieRequest } from '@/types/ombi/api/GetMovieRequests';
import process from 'process';
import { ExitCode } from '@/common/utils/exitCode';
import { attempt } from '@/common/utils/attempt';
import axios from 'axios';

@Service()
export class OmbiIntegration {

  private static readonly logger = createLogger('OmbiIntegration');

  constructor(
    private readonly client: PrismaClient,
  ) {
  }

  async syncMovies(requests: MovieRequest[]) {
    await Promise.all(requests.map(this.createOrUpdateMovie.bind(this)));
    await this.findAndUpdateOldMovies(requests);
  }

  async syncTv(requests: TvRequest[]) {
  }

  private async syncMoviesTask() {
    const logger = createLogger('Task "Sync Ombi Movies"');

    const url = process.env.OMBI_URL!;
    if (!url) {
      logger.error('OMBI_URL environment variable is not set!');
      process.exit(ExitCode.CONFIGURATION_ERROR);
    }
    const apiKey = process.env.OMBI_API_KEY!;
    if (!apiKey) {
      logger.error('OMBI_API_KEY environment variable is not set!');
      process.exit(ExitCode.CONFIGURATION_ERROR);
    }

    logger.info('Syncing Movie requests...');

    const requestsResponses = await attempt(3, () => {
      return axios.get<MovieRequest[]>(`${url}/api/v1/Request/movie`, {
        headers: {
          'ApiKey': apiKey,
        },
      });
    });

    const requests = requestsResponses.data;
    logger.info(`Movie requests sync complete! Found ${requests.length} movie requests.`);
    await this.syncMovies(requests);
  }

  private async syncTvTask() {
    const logger = createLogger('Task "Sync Ombi TV"');

    const url = process.env.OMBI_URL!;
    if (!url) {
      logger.error('OMBI_URL environment variable is not set!');
      process.exit(ExitCode.CONFIGURATION_ERROR);
    }
    const apiKey = process.env.OMBI_API_KEY!;
    if (!apiKey) {
      logger.error('OMBI_API_KEY environment variable is not set!');
      process.exit(ExitCode.CONFIGURATION_ERROR);
    }

    logger.info('Syncing TV requests...');

    const requestsResponses = await attempt(3, () => {
      return axios.get<TvRequest[]>(`${url}/api/v1/Request/tv`, {
        headers: {
          'ApiKey': apiKey,
        },
      });
    });

    const requests = requestsResponses.data;
    logger.info(`TV requests sync complete! Found ${requests.length} movie requests.`);
    await this.syncTv(requests);

  }

  private async createOrUpdateMovie(m: MovieRequest) {
    const movie = await this.client.movie.findFirst({
      where: {
        OR: [
          { ombiRequestId: String(m.id) },
          { tmdbId: String(m.theMovieDbId) },
          { imdbId: m.imdbId },
        ],
      },
    });

    const data: Partial<Movie> = {
      ombiRequestId: String(m.id),
      tmdbId: (m.theMovieDbId && m.theMovieDbId !== 0) ? String(m.theMovieDbId) : null,
      imdbId: (m.imdbId && m.imdbId !== '0') ? m.imdbId : null,
      title: m.title,
      ombiRequestState: m.available ? OmbiRequestDataState.AVAILABLE :
        m.denied ? OmbiRequestDataState.REQUEST_DENIED :
          m.approved ? OmbiRequestDataState.PROCESSING_REQUEST :
            OmbiRequestDataState.PENDING_APPROVAL,
    };

    if (movie) {
      await this.client.movie.update({ data, where: { id: movie.id } });
    } else {
      await this.client.movie.create({ data });
    }
  }

  private async findAndUpdateOldMovies(m: MovieRequest[]) {
    const { count } = await this.client.movie.updateMany({
      data: {
        ombiRequestId: null,
        ombiRequestState: OmbiRequestDataState.NONE,
      },
      where: {
        OR: [
          {
            AND: [
              { ombiRequestId: { not: null } },
              { ombiRequestId: { notIn: m.map(m => String(m.id)) } },
            ],
          },
          {
            ombiRequestState: { not: OmbiRequestDataState.NONE },
          },
        ],
      },
    });

    if (count > 0) {
      OmbiIntegration.logger.info(`Found and updated ${count} movies that are not in the Ombi database`);
    }
  }
}
