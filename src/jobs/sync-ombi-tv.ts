import { AbstractJob } from '@/app/jobs';
import { createLogger } from '@/app/logger';
import { attempt } from '@/utils/attempt';
import axios, { AxiosInstance } from 'axios';
import { TvRequest } from '@/types/ombi/api/GetTvRequests';
import { OmbiIntegrationService } from '@/services/integrations/ombi';

export class SyncOmbiTvJob extends AbstractJob {
  private static readonly logger = createLogger('Job "Sync Ombi TV"');
  private api: AxiosInstance;

  constructor(
    private readonly ombi: OmbiIntegrationService,
    ombiUrl: string,
    ombiApiKey: string,
  ) {
    super({
      id: 'sync-ombi-tv',
      name: 'Sync TV requests from Ombi',
      interval: { minutes: 10 },
      runImmediately: true,
    });

    this.api = axios.create({
      baseURL: ombiUrl,
      headers: { ApiKey: ombiApiKey },
    });
  }

  async run() {
    SyncOmbiTvJob.logger.info('Syncing TV requests...');
    const response = await attempt(3, () => this.api.get<TvRequest[]>(`/api/v1/Request/tv`));
    const requests = response.data;
    SyncOmbiTvJob.logger.info(`Ombi sync complete! Found ${requests.length} TV requests.`);
    for (const request of requests) {
      await this.ombi.syncShow(request);
    }
    await this.ombi.untrackShows(requests);
  }
}
