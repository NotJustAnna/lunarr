import { Job } from '@/common/jobs';
import { createLogger } from '@/common/logger';
import { MoviesRepository } from '@/repositories/movies';
import { attempt } from '@/common/utils/attempt';
import axios, { AxiosInstance } from 'axios';
import { MovieRequest } from '@/types/ombi/api/GetMovieRequests';

export class SyncOmbiMoviesJob implements Job {
  private static readonly logger = createLogger('Job "Sync Ombi Movies"');
  private api: AxiosInstance;

  constructor(
    private readonly movies: MoviesRepository,
    ombiUrl: string,
    ombiApiKey: string,
  ) {
    this.api = axios.create({
      baseURL: ombiUrl,
      headers: { ApiKey: ombiApiKey },
    });
  }

  async run() {
    SyncOmbiMoviesJob.logger.info('Syncing Movie requests...');
    const response = await attempt(3, () => this.api.get<MovieRequest[]>(`/api/v1/Request/movie`));
    const requests = response.data;
    SyncOmbiMoviesJob.logger.info(`Ombi sync complete! Found ${requests.length} movies requests.`);
    await Promise.all(requests.map(request => this.movies.upsertFromOmbi(request)));
    const count = await this.movies.ensureOnlyOmbiMovies(requests);
    if (count > 0) {
      SyncOmbiMoviesJob.logger.info(`Untracked ${count} movies requests that aren't known by Ombi anymore.`);
    }
  }
}
