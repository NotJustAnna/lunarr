import { Job } from '@/common/jobs';
import { RadarrMovie } from '@/types/radarr/api/RadarrMovie';
import { createLogger } from '@/common/logger';
import { attempt } from '@/common/utils/attempt';
import axios, { AxiosInstance } from 'axios';
import { RadarrIntegrationService } from '@/services/integrations/radarr';

export class SyncRadarrJob implements Job {
  private static readonly logger = createLogger('Job "Sync Radarr"');
  private api: AxiosInstance;

  constructor(
    private readonly radarr: RadarrIntegrationService,
    radarrUrl: string,
    radarrApiKey: string,
  ) {
    this.api = axios.create({
      baseURL: radarrUrl,
      headers: {
        'X-Api-key': radarrApiKey,
      },
    });
  }

  async run() {
    SyncRadarrJob.logger.info('Syncing Movies...');
    const response = await attempt(3, () => this.api.get<RadarrMovie[]>(`/api/v3/movie`));
    const movies = response.data;
    SyncRadarrJob.logger.info(`Radarr sync complete! Found ${movies.length} movies.`);

    await Promise.all(movies.map(movie => this.radarr.syncMovie(movie)));
    await this.radarr.untrackMovies(movies);
  }
}
