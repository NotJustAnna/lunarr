import { createLogger } from '../logger';
import 'dotenv/config';
import { ParentPortTransport } from '../../messaging/transport/parentPort';
import { MessageTransport } from '../../messaging/transport';
import { ErrorMessage } from '../../messaging/messages';
import * as process from 'process';
import { ExitCode } from './exitCode';

export interface Service {
}

export interface ServiceInit {
  init(): void | Promise<void>;
}

function hasInit(service: Service | ServiceInit): service is ServiceInit {
  return (service as ServiceInit).init !== undefined;
}

export function startService(ServiceImpl: new (transport: MessageTransport) => Service) {
  const transport = new ParentPortTransport(true);
  asyncStart(transport, ServiceImpl).catch(error => {
    const logger = createLogger(ServiceImpl.name);
    logger.error('Error while initializing service', { error });
    transport.send('@error', new ErrorMessage(error));
    process.exit(ExitCode.SOFTWARE_ERROR);
  });
}

async function asyncStart(transport: MessageTransport, ServiceImpl: new (transport: MessageTransport) => Service) {
  const logger = createLogger(ServiceImpl.name);

  logger.info(`Starting ${ServiceImpl.name} service...`);

  const service: Service = new ServiceImpl(transport);
  if (hasInit(service)) {
    await service.init();
  }
}
