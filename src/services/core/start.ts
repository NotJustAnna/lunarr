import 'source-map-support/register';
import { FlixCore } from '@/services/core';
import { startService } from '@/common/init/worker';

startService(FlixCore);
