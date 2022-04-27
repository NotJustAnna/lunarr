import 'source-map-support/register';
import process from 'process';
import { createLogger } from '../../../utils/logger';
import { PostOffice } from '../../../messaging/postOffice';
import { ParentPortTransport } from '../../../messaging/transport/parentPort';
import { attempt } from '../../../utils/attempt';
import { ExitCode } from '../../../utils/init/exitCode';
import axios from 'axios';
import { OmbiMovieSyncMessage } from '../../../messaging/messages/sync';
import { MovieRequest } from '../../../types/ombi/api/GetMovieRequests';

const url = process.env.OMBI_URL!;
const apiKey = process.env.OMBI_API_KEY!;

const logger = createLogger('Task "Sync Ombi Movies"');
const postOffice = new PostOffice(new ParentPortTransport());

async function main() {
  logger.info('Syncing Movie requests...');

  const requestsResponses = await attempt(3, () => {
    return axios.get<MovieRequest[]>(`${url}/api/v1/Request/movie`, {
      headers: {
        'ApiKey': apiKey,
      },
    });
  });

  const requests = requestsResponses.data;
  logger.info(`Movie requests sync complete! Found ${requests.length} movie requests.`);
  postOffice.send('core', new OmbiMovieSyncMessage({ requests }));
  process.exit(ExitCode.SUCCESS);
}

main().catch((e) => {
  postOffice.sendError(e);
  process.exit(ExitCode.SOFTWARE_ERROR);
});
