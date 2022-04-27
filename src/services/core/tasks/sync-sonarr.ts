import 'source-map-support/register';
import { SonarrSeries } from '../../../types/sonarr/api/SonarrSeries';
import { SonarrEpisode } from '../../../types/sonarr/api/SonarrEpisode';
import { createLogger } from '../../../utils/logger';
import { parentPort } from '../../../utils/workers';
import axios from 'axios';

const url = process.env.SONARR_URL!;
const apiKey = process.env.SONARR_API_KEY!;

async function attempt<T>(tries: number, func: () => T | Promise<T>) {
  for (let i = 0; i < tries; i++) {
    try {
      return await func();
    } catch (e) {
      if (i === tries - 1) {
        throw e;
      }
    }
  }
  throw new Error('Assertion error');
}

const logger = createLogger('task/sync-sonarr');
const port = parentPort(logger);

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

  port.postMessage(['core', {
    type: 'all-series',
    data: allSeries,
  }]);

  let seriesDone = 0;

  const allEpisodesSynced = Promise.all(allSeries.map(async (series) => {
    const episodesPromise = await attempt(3, () => {
      return axios.get<SonarrEpisode[]>(`${url}/api/episode?seriesId=${series.id}`, {
        headers: {
          'X-Api-key': apiKey,
        },
      });
    });
    port.postMessage(['core', {
      type: 'episodes',
      seriesId: series.id,
      data: episodesPromise.data,
    }]);
  }));

  function logProgress() {
    setTimeout(() => {
      if (seriesDone !== allSeries.length) {
        // percentage of series done
        const progress = Math.floor((seriesDone / allSeries.length) * 1000) / 10;

        logger.info(`Synced episodes of ${seriesDone} of ${allSeries.length} series. (${progress}% done)`);
        logProgress();
      }
    }, 1000);
  }

  logProgress();
  await allEpisodesSynced;
  port.postMessage(['core', {
    type: 'done',
  }]);
  logger.info('Sonarr sync complete!');
}

main().catch((e) => {
  port.postMessage(['@error', e]);
  port.postMessage(['core', {
    type: 'done',
  }]);
  process.exit(1);
});
