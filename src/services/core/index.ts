import { MessageSender, Service, ServiceInit } from '../../utils/init/worker';
import { SonarrHandler } from './handler/sonarr';
import { createLogger } from '../../utils/logger';
import axios from 'axios';
import { TvRequest } from '../../types/ombi/api/GetTvRequests';
import { MovieRequest } from '../../types/ombi/api/GetMovieRequests';
import * as process from 'process';
import { FlixDataSource } from '../../database';
import { PostOffice } from '../../utils/postOffice';

export class FlixCore implements Service, ServiceInit {
  private static readonly logger = createLogger('FlixCore');

  private readonly database = FlixDataSource;
  private readonly postOffice: PostOffice;

  private readonly sonarrHandler = new SonarrHandler(this.database);

  constructor(send: MessageSender) {
    this.postOffice = new PostOffice(send);
  }

  async init() {
    await this.database.initialize();

    this.postOffice.sendNoReply('@start', [
      { name: 'core/sync-sonarr', dir: 'core/tasks/sync-sonarr.js' },
      { name: 'core/sync-radarr', dir: 'core/tasks/sync-radarr.js' },
    ]);

    await Promise.all([
      this.postOffice.awaitByMessage('core/sync-sonarr', { type: 'done' }),
      this.postOffice.awaitByMessage('core/sync-radarr', { type: 'done' }),
    ]);

    this.postOffice.sendNoReply('@start', [
      { name: 'core/sync-ombi-tv', dir: 'core/tasks/sync-ombi-tv.js' },
      { name: 'core/sync-ombi-movies', dir: 'core/tasks/sync-ombi-movies.js' },
      { name: 'core/sync-jellyfin', dir: 'core/tasks/sync-jellyfin.js' },
    ]);

    await Promise.all([
      this.postOffice.awaitByMessage('core/sync-ombi-tv', { type: 'done' }),
      this.postOffice.awaitByMessage('core/sync-ombi-movies', { type: 'done' }),
      this.postOffice.awaitByMessage('core/sync-jellyfin', { type: 'done' }),
    ]);

    FlixCore.logger.info(`FlixCore initialized, starting discord and http...`);
    this.postOffice.sendNoReply('@start', ['discord', 'http']);
  }

  async onMessage(source: string, data: any, nonce?: any) {
    this.postOffice.messageIncoming(source, data, nonce);
    if (source === 'core/sync-sonarr') {
      await this.sonarrHandler.handleSync(data);
    }
  }

  private async ombiTvSync() {
    FlixCore.logger.info('Syncing ombi tv requests...');
    const OMBI_URL = process.env.OMBI_URL!;
    const OMBI_API_KEY = process.env.OMBI_API_KEY!;
    const requestsResponse = await axios.get<TvRequest[]>(`${OMBI_URL}/api/v1/Request/tv`, {
      headers: {
        'ApiKey': OMBI_API_KEY,
      },
    });
    FlixCore.logger.warn('Ombi tv requests sync not implemented yet');
  }

  private async ombiMovieSync() {
    FlixCore.logger.info('Syncing ombi movie requests...');
    const OMBI_URL = process.env.OMBI_URL!;
    const OMBI_API_KEY = process.env.OMBI_API_KEY!;
    const requestsResponse = await axios.get<MovieRequest[]>(`${OMBI_URL}/api/v1/Request/movie`, {
      headers: {
        'ApiKey': OMBI_API_KEY,
      },
    });
    FlixCore.logger.warn('Ombi movie requests sync not implemented yet');
  }

  private async radarrSync() {
    FlixCore.logger.info('Syncing radarr requests...');
    FlixCore.logger.warn('Radarr sync not implemented yet');
  }

}

