import 'reflect-metadata';
import * as setupToInit from '@/app/init/setup/all';
import * as registeredControllers from '@/app/init/all';
import { Container } from 'typedi';
import { hasInit } from '@/app/init/interfaces';
import { createLogger } from '@/app/logger';

export async function initApp() {
  const logger = createLogger('Application');
  logger.info('Starting application...');

  await Promise.all(Object.values(setupToInit).map(async (c) => {
    try {
      const instance = Container.get(c);
      Container.remove(c);
      if (hasInit(instance)) {
        await instance.init();
      }
    } catch (error) {
      logger.error(`Error while setting up (error on ${c.name})`, { error });
    }
  }));
  await Promise.all(Object.values(registeredControllers).map(async (c) => {
    try {
      const instance = Container.get(c);
      if (hasInit(instance)) {
        await instance.init();
      }
    } catch (error) {
      logger.error(`Error while initializing ${c.name}`, { error });
    }
  }));
  logger.info('Application started');
}
