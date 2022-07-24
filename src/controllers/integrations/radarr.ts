import { Service } from 'typedi';
import { createLogger } from '@/common/logger';
import process from 'process';
import { MoviesRepository } from '@/repositories/movies';
import { SyncRadarrJob } from '@/jobs/sync-radarr';

@Service()
export class RadarrIntegration {
  private static readonly logger = createLogger('RadarrIntegration');

  constructor(private readonly movies: MoviesRepository) {
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
      // TODO Register job
      new SyncRadarrJob(this.movies, url, apiKey);
    }
  }
}
