import 'source-map-support/register';
import process from 'process';
import { createLogger } from '../../../utils/logger';
import { PostOffice } from '../../../messaging/postOffice';
import { ParentPortTransport } from '../../../messaging/transport/parentPort';
import { attempt } from '../../../utils/attempt';
import { ExitCode } from '../../../utils/init/exitCode';
import axios from 'axios';
import { RadarrMovie } from '../../../types/radarr/api/RadarrMovie';
import { RadarrSyncMessage } from '../../../messaging/messages/sync';

const url = process.env.RADARR_URL!;
const apiKey = process.env.RADARR_API_KEY!;

const logger = createLogger('Task "Sync Radarr"');
const postOffice = new PostOffice(new ParentPortTransport());

async function main() {
  logger.info('Syncing Movies...');

  const moviesResponse = await attempt(3, () => {
    return axios.get<RadarrMovie[]>(`${url}/api/v3/movie`, {
      headers: {
        'X-Api-key': apiKey,
      },
    });
  });

  const movies = moviesResponse.data;
  logger.info(`Radarr sync complete! Found ${movies.length} movies.`);
  postOffice.send('core', new RadarrSyncMessage({ movies }));
  process.exit(ExitCode.SUCCESS);
}

main().catch((e) => {
  postOffice.sendError(e);
  process.exit(ExitCode.SOFTWARE_ERROR);
});
