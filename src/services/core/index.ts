import { Service, ServiceInit } from '../../utils/init/worker';
import { SonarrHandler } from './handler/sonarr';
import { createLogger } from '../../utils/logger';
import { FlixDataSource } from '../../database';
import { MessageTransport } from '../../messaging/transport';
import {
  OmbiMovieSyncMessage,
  OmbiTvSyncMessage,
  RadarrSyncMessage,
  SonarrSyncMessage,
} from '../../messaging/messages/sync';
import { Result } from '../../messaging/packet/types';
import { RadarrHandler } from './handler/radarr';
import { OmbiMovieHandler } from './handler/ombiMovie';
import { OmbiTvHandler } from './handler/ombiTv';
import { CorePostOffice } from './postOffice';
import { UserHandler } from './handler/user';
import { InitFlatAssocMessage, InitFlatAssocReply } from '../../messaging/messages/flatAssoc';
import { ErrorReply } from '../../messaging/messages';
import { localGenerator } from 'nanoflakes';

export class FlixCore implements Service, ServiceInit {
  private static readonly logger = createLogger('FlixCore');

  private readonly database = FlixDataSource;
  private readonly postOffice: CorePostOffice;
  private readonly nanoflakes = localGenerator(1653700000000, 0);

  private readonly sonarrHandler = new SonarrHandler(this.database);
  private readonly radarrHandler = new RadarrHandler(this.database);
  private readonly ombiMovieHandler = new OmbiMovieHandler(this.database);
  private readonly ombiTvHandler = new OmbiTvHandler(this.database);
  private readonly userHandler = new UserHandler(this.database, this.nanoflakes);

  constructor(transport: MessageTransport) {
    this.postOffice = new CorePostOffice(transport);
    this.postOffice.ofType(SonarrSyncMessage, (_, { episodes, series }) => {
      this.sonarrHandler.sync(series, episodes).catch(error => {
        FlixCore.logger.error('Error while syncing Sonarr data', { error });
      });
      return Result.Continue;
    });
    this.postOffice.ofType(RadarrSyncMessage, (_, { movies }) => {
      this.radarrHandler.sync(movies).catch(error => {
        FlixCore.logger.error('Error while syncing Radarr data', { error });
      });
      return Result.Continue;
    });
    this.postOffice.ofType(OmbiMovieSyncMessage, (_, { requests }) => {
      this.ombiMovieHandler.sync(requests).catch(error => {
        FlixCore.logger.error('Error while syncing Ombi movie data', { error });
      });
      return Result.Continue;
    });
    this.postOffice.ofType(OmbiTvSyncMessage, (_, { requests }) => {
      this.ombiTvHandler.sync(requests).catch(error => {
        FlixCore.logger.error('Error while syncing Ombi tv data', { error });
      });
      return Result.Continue;
    });
    this.postOffice.ofType(InitFlatAssocMessage, (from, { id, discordUserId }) => {
      try {
        const link = this.userHandler.initFlatAssoc(discordUserId);
        this.postOffice.send(from, new InitFlatAssocReply({ replyTo: id, link }));
      } catch (error) {
        FlixCore.logger.error('Error while initializing FLAT-based association flow', { error });
        this.postOffice.send(from, new ErrorReply({ replyTo: id, error }));
      }
      return Result.Continue;
    });
  }

  async init() {
    await this.database.initialize();

    return; // FIXME Added for testing

    const showsPromise = this.postOffice.awaitServiceStop('core/sync-sonarr').then(() => {
      const promise = this.postOffice.awaitServiceStop('core/sync-ombi-tv');
      this.postOffice.startServices([
        { name: 'core/sync-ombi-tv', file: 'core/tasks/sync-ombi-tv.js' },
      ]);
      return promise;
    });

    const moviesPromise = this.postOffice.awaitServiceStop('core/sync-radarr').then(() => {
      const promise = this.postOffice.awaitServiceStop('core/sync-ombi-movies');
      this.postOffice.startServices([
        { name: 'core/sync-ombi-movies', file: 'core/tasks/sync-ombi-movies.js' },
      ]);
      return promise;
    });

    const jellyfinPromise = Promise.all([showsPromise, moviesPromise]).then(() => {
      const promise = this.postOffice.awaitServiceStop('core/sync-jellyfin');
      this.postOffice.startServices([
        { name: 'core/sync-jellyfin', file: 'core/tasks/sync-jellyfin.js' },
      ]);
      return promise;
    });

    this.postOffice.startServices([
      { name: 'core/sync-sonarr', file: 'core/tasks/sync-sonarr.js' },
      { name: 'core/sync-radarr', file: 'core/tasks/sync-radarr.js' },
    ]);

    await jellyfinPromise;

    FlixCore.logger.info(`FlixCore initialized, starting discord and http...`);
    this.postOffice.startServices(['discord', 'http']);
  }
}

