import { Job } from '@/common/jobs';
import { createLogger } from '@/common/logger';
import { attempt } from '@/common/utils/attempt';
import axios, { AxiosInstance } from 'axios';
import { SonarrSeries } from '@/types/sonarr/api/SonarrSeries';
import { SonarrEpisode } from '@/types/sonarr/api/SonarrEpisode';
import { withProgress } from '@/common/utils/progress';
import { SonarrIntegrationService } from '@/services/integrations/sonarr';
import { ShowSeason } from '@/prisma-client';
import { SonarrSeason } from '@/types/sonarr/api/SonarrSeason';

export class SyncSonarrJob implements Job {
  private static readonly logger = createLogger('Job "Sync Sonarr"');
  private api: AxiosInstance;

  constructor(
    private readonly sonarr: SonarrIntegrationService,
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

        const show = await this.sonarr.syncShow(s);
        const seasons = await Promise.all(s.seasons.map(season => this.sonarr.syncSeason(show.id, season)));

        const seasonIdByNumber = seasons.reduce((acc, s) => {
          acc[s.number] = s.id;
          return acc;
        }, {} as Record<number, ShowSeason['id']>);

        await Promise.all(r.data.map(e => this.sonarr.syncEpisode(seasonIdByNumber[e.seasonNumber], e)));

        const sonarrSeasonByNumber = s.seasons.reduce((acc, s) => {
          acc[s.seasonNumber] = s;
          return acc;
        }, {} as Record<number, SonarrSeason>);

        await this.sonarr.untrackSeasonsAndEpisodes(
          show.id,
          seasons.map(s => ({ id: s.id, external: sonarrSeasonByNumber[s.number] })),
          r.data,
        );
      }),
      500,
      (done, total) => {
        const progress = Math.floor((done / total) * 1000) / 10;

        SyncSonarrJob.logger.info(`Synced episodes of ${done} of ${total} series. (${progress}% done)`);
      },
    );
    await this.sonarr.untrackShows(series);
  }
}
