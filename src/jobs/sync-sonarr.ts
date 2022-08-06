import { AbstractJob } from '@/app/jobs';
import { createLogger } from '@/app/logger';
import { attempt } from '@/utils/attempt';
import axios, { AxiosInstance } from 'axios';
import { SonarrSeries } from '@/types/sonarr/api/SonarrSeries';
import { SonarrEpisode } from '@/types/sonarr/api/SonarrEpisode';
import { ProgressUtil } from '@/utils/progress';
import { SonarrIntegrationService } from '@/services/integrations/sonarr';
import { ShowSeason } from '@prisma/client';
import { SonarrSeason } from '@/types/sonarr/api/SonarrSeason';

export class SyncSonarrJob extends AbstractJob {
  private static readonly logger = createLogger('Job "Sync Sonarr"');
  private api: AxiosInstance;

  private progress?: { done: number; total: number };

  constructor(
    private readonly sonarr: SonarrIntegrationService,
    sonarrUrl: string,
    sonarrApiKey: string,
  ) {
    super({
      id: 'sync-sonarr',
      name: 'Sync series from Sonarr',
      interval: { minutes: 10 },
      runImmediately: true,
    });

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
    const progress = new ProgressUtil(series.length, 750, (done, total) => {
      const progress = Math.floor((done / total) * 1000) / 10;
      SyncSonarrJob.logger.info(`Synced episodes of ${done} of ${total} series. (${progress}% done)`);
    });

    for (const s of series) {
      const r = await attempt(3, () => this.api.get<SonarrEpisode[]>(`/api/episode`, {
        params: { seriesId: s.id },
      }));

      const show = await this.sonarr.syncShow(s);
      const seasons: ShowSeason[] = [];
      for (const season of s.seasons) {
        seasons.push(await this.sonarr.syncSeason(show.id, season));
      }

      const seasonIdByNumber = seasons.reduce((acc, s) => {
        acc[s.number] = s.id;
        return acc;
      }, {} as Record<number, ShowSeason['id']>);

      for (const e of r.data) {
        await this.sonarr.syncEpisode(seasonIdByNumber[e.seasonNumber], e);
      }

      const sonarrSeasonByNumber = s.seasons.reduce((acc, s) => {
        acc[s.seasonNumber] = s;
        return acc;
      }, {} as Record<number, SonarrSeason>);

      // TODO
      // await this.sonarr.untrackSeasonsAndEpisodes(
      //   show.id,
      //   seasons.map(s => ({ id: s.id, external: sonarrSeasonByNumber[s.number] })),
      //   r.data,
      // );
      progress.next();
      this.progress = { done: progress.done, total: progress.total };
    }
    delete this.progress;
    SyncSonarrJob.logger.info(`Successfully synced ${series.length} series.`);
    // await this.sonarr.untrackShows(series);
  }

  toJSON() {
    return { ...super.toJSON(), progress: this.progress };
  }
}
