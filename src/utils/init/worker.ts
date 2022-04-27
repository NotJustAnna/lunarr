import { createLogger } from '../logger';
import 'dotenv/config';
import { parentPort } from '../workers';
import { MessagePort } from 'worker_threads';

export type MessageSender = (destination: string, data: any, nonce?: any) => void;

export interface Service {
  onMessage(source: string, data: any, nonce?: any): void | Promise<void>;
}

export interface ServiceInit {
  init(): void | Promise<void>;
}

function hasInit(service: Service | ServiceInit): service is ServiceInit {
  return (service as ServiceInit).init !== undefined;
}

export function startService(ServiceImpl: new (sender: MessageSender) => Service) {
  const port = parentPort();

  asyncStart(port, ServiceImpl).catch(err => {
    createLogger(ServiceImpl.name).error('Error while initializing service', { err });
    parentPort().postMessage(['@error', err]);
    process.exit(70);
  });
}

async function asyncStart(port: MessagePort, ServiceImpl: new (sender: MessageSender) => Service) {
  const logger = createLogger(ServiceImpl.name);

  logger.info(`Starting ${ServiceImpl.name} service...`);
  const sender = (destination: string, data: any, nonce?: any) => {
    port.postMessage([destination, data, nonce]);
  };
  const service: Service = new ServiceImpl(sender);
  if (hasInit(service)) {
    await service.init();
  }
  port.on('message', (message: any) => {
    const [destination, data, nonce] = message;
    service.onMessage(destination, data, nonce);
  });
}
