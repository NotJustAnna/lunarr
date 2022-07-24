import { Service } from 'typedi';
import { createLogger } from '@/common/logger';
import process from 'process';
import { ShowsRepository } from '@/repositories/shows';
import { ShowEpisodesRepository } from '@/repositories/showEpisodes';
import { SyncSonarrJob } from '@/jobs/sync-sonarr';

@Service()
export class SonarrIntegration {

  private static readonly logger = createLogger('SonarrIntegration');

  constructor(
    private readonly shows: ShowsRepository,
    private readonly showEpisodes: ShowEpisodesRepository,
  ) {
    const url = process.env.SONARR_URL!;
    const apiKey = process.env.SONARR_API_KEY!;

    if (!(url && apiKey)) {
      if (!url) {
        SonarrIntegration.logger.error('SONARR_URL environment variable is not set!');
      }
      if (!apiKey) {
        SonarrIntegration.logger.error('SONARR_API_KEY environment variable is not set!');
      }
    } else {
      // TODO Register job
      new SyncSonarrJob(this.shows, this.showEpisodes, url, apiKey);
    }
  }
}
