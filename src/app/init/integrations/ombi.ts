import { Service } from 'typedi';
import { createLogger } from '@/app/logger';
import process from 'process';
import { SyncOmbiMoviesJob } from '@/jobs/sync-ombi-movies';
import { SyncOmbiTvJob } from '@/jobs/sync-ombi-tv';
import { OmbiIntegrationService } from '@/services/integrations/ombi';

@Service()
export class OmbiIntegration {

  private static readonly logger = createLogger('OmbiIntegration');

  constructor(private readonly ombi: OmbiIntegrationService) {
    const url = process.env.OMBI_URL!;
    const apiKey = process.env.OMBI_API_KEY!;
    if (!(url && apiKey)) {
      if (!url) {
        OmbiIntegration.logger.error('OMBI_URL environment variable is not set!');
      }
      if (!apiKey) {
        OmbiIntegration.logger.error('OMBI_API_KEY environment variable is not set!');
      }
    } else {
      // TODO Register job
      new SyncOmbiMoviesJob(this.ombi, url, apiKey);
      new SyncOmbiTvJob(this.ombi, url, apiKey);
    }
  }
}
