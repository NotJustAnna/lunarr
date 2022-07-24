import { Job } from '@/common/jobs';
import { createLogger } from '@/common/logger';
import { attempt } from '@/common/utils/attempt';
import axios, { AxiosInstance } from 'axios';
import { ShowsRepository } from '@/repositories/shows';
import { SonarrSeries } from '@/types/sonarr/api/SonarrSeries';
import { SonarrEpisode } from '@/types/sonarr/api/SonarrEpisode';
import { withProgress } from '@/common/utils/progress';
import { ShowEpisodesRepository } from '@/repositories/showEpisodes';

export class SyncSonarrJob implements Job {
  private static readonly logger = createLogger('Job "Sync Sonarr"');
  private api: AxiosInstance;

  constructor(
    private readonly shows: ShowsRepository,
    private readonly showEpisodes: ShowEpisodesRepository,
    sonarrUrl: string,
    sonarrApiKey: string,
  ) {
    this.api = axios.create({
      baseURL: sonarrUrl,
      headers: {
        'X-Api-key': sonarrApiKey,
      },
    });
  }

  async run() {
    SyncSonarrJob.logger.info('Syncing Series...');
    const response = await attempt(3, () => this.api.get<SonarrSeries[]>(`/api/series`));
    const series = response.data;

    SyncSonarrJob.logger.info(`Found ${series.length} series. Syncing episodes...`);
    await withProgress(
      series.map(async (s) => {
        const r = await attempt(3, () => this.api.get<SonarrEpisode[]>(`/api/episode`, {
          params: { seriesId: s.id },
        }));
        const show = await this.shows.upsertFromSonarr(s);
        await this.showEpisodes.batchUpdateEpisodes(show.id, r.data);
      }),
      500,
      (done, total) => {
        const progress = Math.floor((done / total) * 1000) / 10;

        SyncSonarrJob.logger.info(`Synced episodes of ${done} of ${total} series. (${progress}% done)`);
      },
    );
    await this.shows.ensureOnlySonarrShows(series);
  }
}
