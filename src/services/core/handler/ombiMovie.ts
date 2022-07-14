import { createLogger } from '../../../utils/logger';
import { MovieRequest } from '../../../types/ombi/api/GetMovieRequests';
import { PrismaClient } from '../../../generated/prisma-client';
import { CorePostOffice } from '../postOffice';
import { OmbiMovieSyncMessage } from '../../../messaging/messages/sync';
import { Result } from '../../../messaging/packet/types';

export class OmbiMovieHandler {
  private static readonly logger = createLogger('OmbiMovieHandler');

  constructor(
    private readonly client: PrismaClient,
    private readonly postOffice: CorePostOffice
  ) {
    this.postOffice.ofType(OmbiMovieSyncMessage, (_, { requests }) => {
      this.sync(requests).catch(error => {
        OmbiMovieHandler.logger.error('Error while syncing Ombi movie data', { error });
      });
      return Result.Continue;
    });
  }

  async sync(requests: MovieRequest[]) {
  }
}
