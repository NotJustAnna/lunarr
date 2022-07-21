import 'source-map-support/register';
import { startService } from '@/common/init/worker';
import { FlixHttp } from '@/services/http';

startService(FlixHttp);
