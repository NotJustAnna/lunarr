import 'reflect-metadata';
import * as batchInit from '@/init/all';
import { createLogger } from '@/app/logger';
import { batchInitialize, fromBarrelFile } from '@/utils/initializer';
import { ExitCode } from '@/utils/exitCode';
import { setup } from '@/app/setup';

export async function initApp() {
  const logger = createLogger('Application');
  logger.info('Starting application...');

  const constructors = fromBarrelFile(batchInit);
  await setup(constructors);
  const init = await batchInitialize(constructors);
  if (init.errors.length > 0) {
    const errors = init.errors, count = errors.length;
    logger.error(`Init phase failed with ${count} error${count === 1 ? '' : 's'}.`, { errors });
    process.exit(ExitCode.FATAL_UNRECOVERABLE_ERROR);
  }

  logger.info('Application started');
}
