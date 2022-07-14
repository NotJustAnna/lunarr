import { createLogger } from '../../../utils/logger';
import { TvRequest } from '../../../types/ombi/api/GetTvRequests';
import { PrismaClient } from '../../../generated/prisma-client';
import { CorePostOffice } from '../postOffice';
import { OmbiMovieSyncMessage, OmbiTvSyncMessage } from '../../../messaging/messages/sync';
import { Result } from '../../../messaging/packet/types';

export class OmbiTvHandler {
  private static readonly logger = createLogger('OmbiTvHandler');

  constructor(
    private readonly client: PrismaClient,
    private readonly postOffice: CorePostOffice,
  ) {
    this.postOffice.ofType(OmbiTvSyncMessage, (_, { requests }) => {
      this.sync(requests).catch(error => {
        OmbiTvHandler.logger.error('Error while syncing Ombi tv data', { error });
      });
      return Result.Continue;
    });
  }

  async sync(requests: TvRequest[]) {
  }
}
