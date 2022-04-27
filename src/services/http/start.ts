import 'source-map-support/register';
import { startService } from '../../utils/init/worker';
import { FlixHttp } from './index';

startService(FlixHttp);
