import { Service } from 'typedi';
import { createLogger } from '@/app/logger';
import process from 'process';
import { SyncRadarrJob } from '@/jobs/sync-radarr';
import { RadarrIntegrationService } from '@/services/integrations/radarr';
import { JobService } from '@/services/jobs';

@Service()
export class RadarrIntegration {
  private static readonly logger = createLogger('RadarrIntegration');

  constructor(
    private readonly radarr: RadarrIntegrationService,
    private readonly jobs: JobService,
  ) {
    const url = process.env.RADARR_URL!;
    const apiKey = process.env.RADARR_API_KEY!;

    if (!(url && apiKey)) {
      if (!url) {
        RadarrIntegration.logger.error('RADARR_URL environment variable is not set!');
      }
      if (!apiKey) {
        RadarrIntegration.logger.error('RADARR_API_KEY environment variable is not set!');
      }
    } else {
      this.jobs.add(new SyncRadarrJob(this.radarr, url, apiKey));
    }
  }
}
