import { Worker } from 'worker_threads';
import { createLogger } from '../logger';
import 'dotenv/config';
import { resolve } from 'path';
import { isServiceStart, ServiceConfig, ServiceStart } from './ServiceStart';

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
  private readonly handlers: Record<string, (source: string, body: any, nonce?: any) => void> = {
    ['@error']: ServiceManager.handleError,
    ['@start']: this.handleStart.bind(this),
  };
  private readonly workers: Record<string, Worker> = {};

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
    for (let key in this.workers) {
      if (key !== name) {
        this.workers[key].postMessage(['@start', name]);
      }
    }

    worker.on('message', this.messageRouter(name));
    worker.on('error', error => ServiceManager.handleError(name, error));
    worker.on('exit', code => {
      delete this.workers[name];
      for (let key in this.workers) {
        this.workers[key].postMessage(['@exit', name]);
      }
      ServiceManager.logger.log(code === 0 ? 'info' : 'error', `Worker "${name}" exited with code ${code}`);
    });
  }

  private handleStart(source: string, body: any) {
    if (isServiceStart(body)) {
      const name = typeof body === 'string' ? body : body.name;
      ServiceManager.logger.info(`Service "${source}" requested to start worker "${name}"`);
      this.startService(body);
      return;
    }
    if (typeof body === 'object' && Array.isArray(body) && body.every(x => isServiceStart(x))) {
      const workers = body.map(x => `"${typeof x === 'string' ? x : x.name}"`).join(', ');
      ServiceManager.logger.info(`Service "${source}" requested to start workers ${workers}`);
      for (const service of body as ServiceStart[]) {
        this.startService(service);
      }
      return;
    }
    ServiceManager.logger.error(`[@start] Invalid body received from service "${source}"`, { source, body });
  }

  private messageRouter(source: string) {
    return (data: any) => {
      if (!Array.isArray(data)) {
        ServiceManager.logger.error(INVALID_MESSAGE, { source, data, reason: NOT_ARRAY });
        return;
      }
      if (data.length < 2) {
        ServiceManager.logger.error(INVALID_MESSAGE, { source, data, reason: INVALID_ARRAY_LENGTH });
        return;
      }
      const [dest, body, nonce] = data;
      if (typeof dest !== 'string') {
        ServiceManager.logger.error(INVALID_MESSAGE, { source, dest, body, nonce, reason: DESTINATION_NOT_A_STRING });
        return;
      }
      if (dest.startsWith('@')) {
        if (dest in this.handlers) {
          this.handlers[dest](source, body, nonce);
        } else {
          ServiceManager.logger.error(INVALID_MESSAGE, { source, dest, body, nonce, reason: UNKNOWN_COMMAND });
        }
        return;
      } else if (dest in this.workers) {
        this.workers[dest].postMessage([source, body, nonce]);
        ServiceManager.logger.debug(MESSAGE_SENT, { source, dest, body, nonce });
        return;
      }
      ServiceManager.logger.error(INVALID_MESSAGE, { source, dest, body, nonce, reason: DESTINATION_DOES_NOT_EXIST });
      return;
    };
  }
}

const MESSAGE_SENT = 'Routed a message from source to destination.';
const INVALID_MESSAGE = 'Received an invalid message, discarding.';
const NOT_ARRAY = 'Received message is not an array.';
const INVALID_ARRAY_LENGTH = 'Received message is an array, but does not have a length of 2.';
const DESTINATION_NOT_A_STRING = 'Received message\'s destination is not a string.';
const DESTINATION_DOES_NOT_EXIST = 'Received message\'s destination does not exist.';
const UNKNOWN_COMMAND = 'Received message\'s destination is an unknown command.';
