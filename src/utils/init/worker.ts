import { parentPort } from 'worker_threads';
import { createLogger } from '../logger';
import 'dotenv/config';

export type MessageSender = (message: [dest: string, data: any]) => void;

export interface Service {
  onMessage(data: any): void | Promise<void>;
}

export interface ServiceInit {
  init(): void | Promise<void>;
}

function hasInit(service: Service | ServiceInit): service is ServiceInit {
  return (service as ServiceInit).init !== undefined;
}

export function start(ServiceImpl: new (sender: MessageSender) => Service) {
  startAsync(ServiceImpl).catch(err => {
    createLogger(ServiceImpl.name).error('Error while initializing service', { err });
    parentPort?.postMessage(['@error', err]);
    process.exit(70);
  });
}

export async function startAsync(ServiceImpl: new (sender: MessageSender) => Service) {
  const logger = createLogger(ServiceImpl.name);
  const port = parentPort;
  if (!port) {
    logger.error('Tried to start service worker on the main thread.');
    logger.error('This is not supported. Please run the service worker in a worker thread.');

    process.exit(78); // configuration error
    throw Error('This code is meant to run on a worker thread!');
  }

  logger.info(`Starting ${ServiceImpl.name} service...`);
  const service: Service = new (ServiceImpl as any)(port.postMessage.bind(port));
  if (hasInit(service)) {
    await service.init();
  }
  port.on('message', service.onMessage.bind(service));
}
