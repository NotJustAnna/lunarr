import { Service, ServiceInit } from '../../utils/init/worker';
import { SonarrHandler } from './handler/connections/sonarr';
import { createLogger } from '../../utils/logger';
import { MessageTransport } from '../../messaging/transport';
import { RadarrHandler } from './handler/connections/radarr';
import { OmbiMovieHandler } from './handler/connections/ombiMovie';
import { OmbiTvHandler } from './handler/connections/ombiTv';
import { CorePostOffice } from './postOffice';
import { UserHandler } from './handler/user';
import { localGenerator } from 'nanoflakes';
import { PrismaClient } from '../../generated/prisma-client';
import { CleanupHandler } from './handler/cleanup';

export class FlixCore implements Service, ServiceInit {
  private static readonly logger = createLogger('FlixCore');

  private readonly client = new PrismaClient();
  private readonly postOffice: CorePostOffice;

  private readonly sonarrHandler: SonarrHandler;
  private readonly radarrHandler: RadarrHandler;
  private readonly ombiMovieHandler: OmbiMovieHandler;
  private readonly ombiTvHandler: OmbiTvHandler;
  private readonly userHandler: UserHandler;
  private readonly cleanupHandler: CleanupHandler;

  private readonly nanoflakes = localGenerator(1653700000000, 0);

  constructor(transport: MessageTransport) {
    this.postOffice = new CorePostOffice(transport);
    this.sonarrHandler = new SonarrHandler(this.client, this.postOffice);
    this.radarrHandler = new RadarrHandler(this.client, this.postOffice);
    this.ombiMovieHandler = new OmbiMovieHandler(this.client, this.postOffice);
    this.ombiTvHandler = new OmbiTvHandler(this.client, this.postOffice);
    this.userHandler = new UserHandler(this.client, this.postOffice, this.nanoflakes);
    this.cleanupHandler = new CleanupHandler(this.client);
  }

  async init() {
    await this.postOffice.runServices([
      { name: 'core/sync-sonarr', file: 'core/tasks/sync-sonarr.js' },
      { name: 'core/sync-radarr', file: 'core/tasks/sync-radarr.js' },
    ]);

    await this.postOffice.runServices([
      { name: 'core/sync-ombi-movies', file: 'core/tasks/sync-ombi-movies.js' },
      { name: 'core/sync-ombi-tv', file: 'core/tasks/sync-ombi-tv.js' },
    ]);

    await this.postOffice.runServices([
      { name: 'core/sync-jellyfin', file: 'core/tasks/sync-jellyfin.js' },
    ]);

    FlixCore.logger.info(`FlixCore initialized, starting discord and http...`);
    this.postOffice.startServices(['discord', 'http']);
  }
}

