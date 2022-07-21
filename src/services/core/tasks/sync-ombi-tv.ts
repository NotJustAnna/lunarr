import 'source-map-support/register';
import process from 'process';
import { createLogger } from '@/common/logger';
import { PostOffice } from '@/common/messaging/postOffice';
import { ParentPortTransport } from '@/common/messaging/transport/parentPort';
import { attempt } from '@/common/utils/attempt';
import { ExitCode } from '@/common/utils/exitCode';
import axios from 'axios';
import { OmbiTvSyncMessage } from '@/common/messaging/messages/sync';
import { TvRequest } from '@/types/ombi/api/GetTvRequests';

const logger = createLogger('Task "Sync Ombi TV"');
const postOffice = new PostOffice(new ParentPortTransport(true));

const url = process.env.OMBI_URL!;
if (!url) {
  logger.error('OMBI_URL environment variable is not set!');
  process.exit(ExitCode.CONFIGURATION_ERROR);
}
const apiKey = process.env.OMBI_API_KEY!;
if (!apiKey) {
  logger.error('OMBI_API_KEY environment variable is not set!');
  process.exit(ExitCode.CONFIGURATION_ERROR);
}

async function main() {
  logger.info('Syncing TV requests...');

  const requestsResponses = await attempt(3, () => {
    return axios.get<TvRequest[]>(`${url}/api/v1/Request/tv`, {
      headers: {
        'ApiKey': apiKey,
      },
    });
  });

  const requests = requestsResponses.data;
  logger.info(`TV requests sync complete! Found ${requests.length} movie requests.`);
  postOffice.send('core', new OmbiTvSyncMessage({ requests }));
  process.exit(ExitCode.SUCCESS);
}

main().catch((e) => {
  postOffice.sendError(e);
  process.exit(ExitCode.SOFTWARE_ERROR);
});
