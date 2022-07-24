import 'reflect-metadata';
import * as setupToInit from './setup/all';
import * as registeredControllers from '@/controllers/all';
import { Container } from 'typedi';
import { AsyncInit } from '@/common/init/interfaces';
import { createLogger } from '@/common/logger';

export async function initApp() {
  const logger = createLogger('Application');
  logger.info('Starting application...');

  const controllersToInit = Object.values(registeredControllers);

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
  await Promise.all(controllersToInit.map(async (c) => {
    try {
      const instance = Container.get(c);
      if (hasInit(instance)) {
        await instance.init();
      }
    } catch (error) {
      logger.error(`Error while initializing controller ${c.name}`, { error });
    }
  }));
  logger.info('Application started');
}

function hasInit(service: any): service is AsyncInit {
  return typeof (service as AsyncInit)?.init === 'function';
}
