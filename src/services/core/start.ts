import 'source-map-support/register';
import { FlixCore } from './index';
import { startService } from '../../utils/init/worker';

startService(FlixCore);
