import { AbstractJob } from '@/app/jobs';
import { createLogger } from '@/app/logger';
import { attempt } from '@/utils/attempt';
import axios, { AxiosInstance } from 'axios';
import { MovieRequest } from '@/types/ombi/api/GetMovieRequests';
import { OmbiIntegrationService } from '@/services/integrations/ombi';

export class SyncOmbiMoviesJob extends AbstractJob {
  private static readonly logger = createLogger('Job "Sync Ombi Movies"');
  private api: AxiosInstance;

  constructor(
    private readonly ombi: OmbiIntegrationService,
    ombiUrl: string,
    ombiApiKey: string,
  ) {
    super({
      id: 'sync-ombi-movies',
      name: 'Sync Movie requests from Ombi',
      interval: { minutes: 10 },
      runImmediately: true,
    });

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
    await Promise.all(requests.map(request => this.ombi.syncMovie(request)));
    await this.ombi.untrackMovies(requests);
  }
}
