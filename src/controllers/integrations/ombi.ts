import { Service } from 'typedi';
import { createLogger } from '@/common/logger';
import process from 'process';
import { ShowsRepository } from '@/repositories/shows';
import { MoviesRepository } from '@/repositories/movies';
import { SyncOmbiMoviesJob } from '@/jobs/sync-ombi-movies';
import { SyncOmbiTvJob } from '@/jobs/sync-ombi-tv';

@Service()
export class OmbiIntegration {

  private static readonly logger = createLogger('OmbiIntegration');

  constructor(
    private readonly movies: MoviesRepository,
    private readonly shows: ShowsRepository,
  ) {
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
      new SyncOmbiMoviesJob(this.movies, url, apiKey);
      new SyncOmbiTvJob(this.shows, url, apiKey);
    }
  }
}
