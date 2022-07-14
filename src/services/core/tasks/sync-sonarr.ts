import 'source-map-support/register';
import { SonarrSeries } from '../../../types/sonarr/api/SonarrSeries';
import { SonarrEpisode } from '../../../types/sonarr/api/SonarrEpisode';
import { createLogger } from '../../../utils/logger';
import axios from 'axios';
import { PostOffice } from '../../../messaging/postOffice';
import { ParentPortTransport } from '../../../messaging/transport/parentPort';
import { SonarrSyncMessage } from '../../../messaging/messages/sync';
import * as process from 'process';
import { ExitCode } from '../../../utils/init/exitCode';
import { attempt } from '../../../utils/attempt';

const logger = createLogger('Task "Sync Sonarr"');
const postOffice = new PostOffice(new ParentPortTransport(true));

const url = process.env.SONARR_URL!;
if (!url) {
  logger.error('SONARR_URL environment variable is not set!');
  process.exit(ExitCode.CONFIGURATION_ERROR);
}
const apiKey = process.env.SONARR_API_KEY!;
if (!apiKey) {
  logger.error('SONARR_API_KEY environment variable is not set!');
  process.exit(ExitCode.CONFIGURATION_ERROR);
}

async function main() {
  logger.info('Syncing Series...');

  const seriesResponse = await attempt(3, () => {
    return axios.get<SonarrSeries[]>(`${url}/api/series`, {
      headers: {
        'X-Api-key': apiKey,
      },
    });
  });

  const allSeries = seriesResponse.data;
  logger.info(`Found ${allSeries.length} series. Syncing episodes...`);

  let seriesDone = 0;

  const allEpisodesSynced = Promise.all(allSeries.map(async (series) => {
    const episodesPromise = await attempt(3, () => {
      return axios.get<SonarrEpisode[]>(`${url}/api/episode?seriesId=${series.id}`, {
        headers: {
          'X-Api-key': apiKey,
        },
      });
    });
    postOffice.send('core', new SonarrSyncMessage({
      series, episodes: episodesPromise.data,
    }));
    seriesDone++;
  }));

  function logProgress(value: number = 0) {
    setTimeout(() => {
      if (seriesDone !== allSeries.length) {
        if (seriesDone !== value) {
          // percentage of series done
          const progress = Math.floor((seriesDone / allSeries.length) * 1000) / 10;

          logger.info(`Synced episodes of ${seriesDone} of ${allSeries.length} series. (${progress}% done)`);
        }
        logProgress(seriesDone);
      }
    }, 500);
  }

  logProgress();
  await allEpisodesSynced;
  logger.info('Sonarr sync complete!');
  process.exit(ExitCode.SUCCESS);
}

main().catch((e) => {
  postOffice.sendError(e);
  process.exit(ExitCode.SOFTWARE_ERROR);
});
