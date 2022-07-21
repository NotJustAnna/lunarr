import { createLogger } from '@/common/logger';
import { MovieRequest } from '@/types/ombi/api/GetMovieRequests';
import { Movie, OmbiRequestDataState, PrismaClient } from '@/prisma-client';
import { CorePostOffice } from '@/services/core/postOffice';
import { OmbiMovieSyncMessage } from '@/common/messaging/messages/sync';
import { Result } from '@/common/messaging/packet/types';

export class OmbiMovieHandler {
  private static readonly logger = createLogger('OmbiMovieHandler');

  constructor(
    private readonly client: PrismaClient,
    private readonly postOffice: CorePostOffice,
  ) {
    this.postOffice.ofType(OmbiMovieSyncMessage, (_, { requests }) => {
      this.sync(requests).catch(error => {
        OmbiMovieHandler.logger.error('Error while syncing Ombi movie data', { error });
      });
      return Result.Continue;
    });
  }

  async sync(requests: MovieRequest[]) {
    await Promise.all(requests.map(this.createOrUpdateMovie.bind(this)));
    await this.findAndUpdateOldMovies(requests);
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
      OmbiMovieHandler.logger.info(`Found and updated ${count} movies that are not in the Ombi database`);
    }
  }
}
