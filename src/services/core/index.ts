import { Service, ServiceInit } from '../../utils/init/worker';
import { SonarrHandler } from './handler/sonarr';
import { createLogger } from '../../utils/logger';
import axios from 'axios';
import { TvRequest } from '../../types/ombi/api/GetTvRequests';
import { MovieRequest } from '../../types/ombi/api/GetMovieRequests';
import * as process from 'process';
import { FlixDataSource } from '../../database';
import { MessageTransport } from '../../messaging/transport';
import { PostOffice } from '../../messaging/postOffice';
import { SonarrSyncMessage } from '../../messaging/messages/syncSonarr';
import { Result } from '../../messaging/packet/types';

export class FlixCore implements Service, ServiceInit {
  private static readonly logger = createLogger('FlixCore');

  private readonly database = FlixDataSource;
  private readonly postOffice: PostOffice;

  private readonly sonarrHandler = new SonarrHandler(this.database);

  constructor(transport: MessageTransport) {
    this.postOffice = new PostOffice(transport);
    this.postOffice.ofType(SonarrSyncMessage, (_, { episodes, series }) => {
      this.sonarrHandler.sync(series, episodes).catch(error => {
        FlixCore.logger.error('Error while syncing Sonarr data', { error });
      });
      return Result.Continue;
    });
  }

  async init() {
    await this.database.initialize();

    const syncSonarrAndRadarr = Promise.all([
      this.postOffice.awaitServiceStop('core/sync-sonarr'),
      this.postOffice.awaitServiceStop('core/sync-radarr'),
    ]);

    this.postOffice.startServices([
      { name: 'core/sync-sonarr', file: 'core/tasks/sync-sonarr.js' },
      { name: 'core/sync-radarr', file: 'core/tasks/sync-radarr.js' },
    ]);
    await syncSonarrAndRadarr;

    const syncOmbiAndJellyfin = Promise.all([
      this.postOffice.awaitServiceStop('core/sync-ombi-tv'),
      this.postOffice.awaitServiceStop('core/sync-ombi-movies'),
      this.postOffice.awaitServiceStop('core/sync-jellyfin'),
    ]);

    this.postOffice.startServices([
      { name: 'core/sync-ombi-tv', file: 'core/tasks/sync-ombi-tv.js' },
      { name: 'core/sync-ombi-movies', file: 'core/tasks/sync-ombi-movies.js' },
      { name: 'core/sync-jellyfin', file: 'core/tasks/sync-jellyfin.js' },
    ]);
    await syncOmbiAndJellyfin;

    FlixCore.logger.info(`FlixCore initialized, starting discord and http...`);
    this.postOffice.startServices(['discord', 'http']);
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

