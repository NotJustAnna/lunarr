import { Job } from '@/common/jobs';
import { createLogger } from '@/common/logger';
import { attempt } from '@/common/utils/attempt';
import axios, { AxiosInstance } from 'axios';
import { ShowsRepository } from '@/repositories/shows';
import { TvRequest } from '@/types/ombi/api/GetTvRequests';

export class SyncOmbiTvJob implements Job {
  private static readonly logger = createLogger('Job "Sync Ombi TV"');
  private api: AxiosInstance;

  constructor(
    private readonly shows: ShowsRepository,
    ombiUrl: string,
    ombiApiKey: string,
  ) {
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
    await Promise.all(requests.map(request => this.shows.upsertFromOmbi(request)));
    await this.shows.ensureOnlyOmbiShows(requests);
  }
}
