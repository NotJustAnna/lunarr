import 'source-map-support/register';
import { FlixDiscord } from './index';
import { startService } from '../../utils/init/worker';

startService(FlixDiscord);
