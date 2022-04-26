import { MessageSender, Service, ServiceInit } from '../../utils/init/worker';
import { SonarrHandler } from './handler/sonarr';
import { createLogger } from '../../utils/logger';
import axios from 'axios';
import { TvRequest } from '../../types/ombi/api/GetTvRequests';
import { MovieRequest } from '../../types/ombi/api/GetMovieRequests';
import * as process from 'process';
import { FlixDataSource } from '../../database';

export class FlixCore implements Service, ServiceInit {
  private static readonly logger = createLogger('FlixCore');

  private readonly database = FlixDataSource;

  private readonly sonarrHandler = new SonarrHandler(this.database);

  constructor(private readonly send: MessageSender) {
  }

  async init() {
    await this.database.initialize();
    await Promise.all([
      this.sonarrHandler.sync(),
      this.radarrSync(),
      this.ombiTvSync(),
      this.ombiMovieSync(),
    ]);
    FlixCore.logger.info(`FlixCore initialized, starting discord and http...`);
    this.send(['@start', ['discord', 'http']]);
  }

  async onMessage(message: any) {
    console.log(message);
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

