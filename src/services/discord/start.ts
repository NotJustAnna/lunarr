import 'source-map-support/register';
import { FlixDiscord } from '@/services/discord';
import { startService } from '@/common/init/worker';

startService(FlixDiscord);
