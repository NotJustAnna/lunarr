import 'reflect-metadata';
import * as batchSetup from '@/app/init/setup/all';
import * as batchInit from '@/app/init/all';
import { createLogger } from '@/app/logger';
import { batchInitialize } from '@/utils/initializer';
import { ExitCode } from '@/utils/exitCode';

export async function initApp() {
  const logger = createLogger('Application');
  logger.info('Starting application...');

  const setup = await batchInitialize(batchSetup);
  if (setup.errors.length > 0) {
    const errors = setup.errors, count = errors.length;
    logger.error(`Set-up phase failed with ${count} error${count === 1 ? '' : 's'}.`, { errors });
    process.exit(ExitCode.FATAL_UNRECOVERABLE_ERROR);
  }

  const init = await batchInitialize(batchInit);
  if (init.errors.length > 0) {
    const errors = init.errors, count = errors.length;
    logger.error(`Init phase failed with ${count} error${count === 1 ? '' : 's'}.`, { errors });
    process.exit(ExitCode.FATAL_UNRECOVERABLE_ERROR);
  }

  logger.info('Application started');
}
