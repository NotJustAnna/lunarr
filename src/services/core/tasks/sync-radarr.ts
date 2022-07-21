import 'source-map-support/register';
import process from 'process';
import { createLogger } from '@/common/logger';
import { PostOffice } from '@/common/messaging/postOffice';
import { ParentPortTransport } from '@/common/messaging/transport/parentPort';
import { attempt } from '@/common/utils/attempt';
import { ExitCode } from '@/common/utils/exitCode';
import axios from 'axios';
import { RadarrMovie } from '@/types/radarr/api/RadarrMovie';
import { RadarrSyncMessage } from '@/common/messaging/messages/sync';

const logger = createLogger('Task "Sync Radarr"');
const postOffice = new PostOffice(new ParentPortTransport(true));

const url = process.env.RADARR_URL!;
if (!url) {
  logger.error('RADARR_URL environment variable is not set!');
  process.exit(ExitCode.CONFIGURATION_ERROR);
}
const apiKey = process.env.RADARR_API_KEY!;
if (!apiKey) {
  logger.error('RADARR_API_KEY environment variable is not set!');
  process.exit(ExitCode.CONFIGURATION_ERROR);
}

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
