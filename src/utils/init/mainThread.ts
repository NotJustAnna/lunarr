import { Worker } from 'worker_threads';
import { createLogger } from '../logger';
import 'dotenv/config';
import { resolve } from 'path';
import { ServiceConfig, ServiceStart } from './ServiceStart';
import { PostExchange } from '../../messaging/postExchange';
import { WorkerTransport } from '../../messaging/transport/worker';
import {
  ListServicesReply,
  ServiceStartedMessage,
  ServiceStoppedMessage,
  StartServiceMessage,
  StopServiceMessage,
  WhoAmIReply,
} from '../../messaging/messages/services';
import { ErrorMessage } from '../../messaging/messages';
import { ExitCode, exitCodeMeanings } from './exitCode';

export function startApp(...services: ServiceStart[]) {
  createLogger('main').info('Starting application...');
  const manager = new ServiceManager();
  for (const service of services) {
    manager.startService(service);
  }
}

class ServiceManager {
  private static readonly logger = createLogger('ServiceManager');
  private static readonly serviceDir = resolve(__dirname, '../../services');
  private readonly postExchange = new PostExchange();
  private readonly workers: Record<string, Worker> = {};

  constructor() {
    this.postExchange.registerEndpoint('@self', (sender, message) => {
      this.postExchange.sendMessage(sender, sender, message);
    });
    this.postExchange.registerEndpoint('@whoami', (sender, message) => {
      this.postExchange.sendMessage('@whoami', sender, new WhoAmIReply({
        replyTo: message.id, serviceName: sender,
      }));
    });
    this.postExchange.registerEndpoint('@all', (sender, message) => {
      for (let recipient of this.postExchange.registeredTransports()) {
        if (recipient !== sender) {
          this.postExchange.sendMessage(sender, recipient, message);
        }
      }
    });
    this.postExchange.registerEndpoint('@list', (sender, message) => {
      this.postExchange.sendMessage('@list', sender, new ListServicesReply({
        replyTo: message.id, services: Object.keys(this.workers),
      }));
    });
    this.postExchange.registerEndpoint('@error', (sender, message) => {
      if (message instanceof ErrorMessage) {
        ServiceManager.handleError(sender, message);
      } else {
        ServiceManager.logger.error(`Message received from service "${sender}"`, { source: sender, message });
      }
    });
    this.postExchange.registerEndpoint('@start', (sender, message) => {
      if (message instanceof StartServiceMessage) {
        for (const service of message.services) {
          this.startService(service);
        }
      } else {
        ServiceManager.logger.error(`Received "@start" from "${sender}" but message is not StartServiceMessage`, { message });
      }
    });
    this.postExchange.registerEndpoint('@stop', (sender, message) => {
      if (message instanceof StopServiceMessage) {
        for (const service of message.services) {
          this.stopService(service);
        }
      } else {
        ServiceManager.logger.error(`Received "@stop" from "${sender}" but message is not StopServiceMessage`, { message });
      }
    });
  }

  private static handleError(source: string, error: any) {
    ServiceManager.logger.error(`Error received from service "${source}"`, { source, error });
  }

  startService(service: ServiceStart) {
    const { name, file, workerData }: ServiceConfig = typeof service === 'string' ? { name: service } : service;
    if (name.startsWith('@')) {
      ServiceManager.logger.error(`'@' is not allowed in service name because it is reserved for special commands. Service '${name}' will be ignored.`);
      return;
    } else if (name in this.workers) {
      ServiceManager.logger.error(`Service '${name}' is already running.`);
      return;
    }

    const worker = new Worker(`${(ServiceManager.serviceDir)}/${file ?? `${name}/start.js`}`, {
      execArgv: ['--require', './.pnp.cjs'],
      workerData,
    });
    this.workers[name] = worker;

    this.postExchange.registerTransport(name, new WorkerTransport(worker));
    worker.on('error', error => ServiceManager.handleError(name, error));
    worker.on('exit', code => {
      delete this.workers[name];
      this.postExchange.removeTransport(name);
      this.postExchange.sendMessage('@stop', '@all', new ServiceStoppedMessage({
        serviceName: name,
        exitCode: code,
      }));
      ServiceManager.logger.log(
        code === ExitCode.SUCCESS ? 'info' : 'error',
        `Worker "${name}" ${exitCodeMeanings[code] ?? `exited with code ${code}`}`,
      );
    });
    this.postExchange.sendMessage('@start', '@all', new ServiceStartedMessage({
      serviceName: name,
    }));
  }

  stopService(name: string) {
    if (name.startsWith('@')) {
      ServiceManager.logger.error(`'@' is not allowed in service name because it is reserved for special commands. Service '${name}' will be ignored.`);
      return;
    } else if (name in this.workers) {
      ServiceManager.logger.error(`Service '${name}' is not running.`);
      return;
    }
    this.workers[name].terminate().catch(error => {
      ServiceManager.logger.error(`Error while stopping service '${name}'`, { error });
    });
  }
}
