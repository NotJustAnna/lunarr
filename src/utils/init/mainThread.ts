import { Worker } from 'worker_threads';
import { createLogger } from '../logger';
import 'dotenv/config';
import { resolve } from 'path';

export function startApp(...modules: string[]) {
  createLogger('main').info('Starting application...');
  new ModularApplication(modules);
}

class ModularApplication {
  private static readonly logger = createLogger('ModularApplication');
  private readonly workers: Record<string, Worker> = {};
  private readonly specialTargets = ['main', '@error'];

  constructor(modules: string[]) {
    const serviceDir = resolve(__dirname, '../../services');

    for (const module of modules) {
      if (this.specialTargets.includes(module)) {
        ModularApplication.logger.warn(`Module ${module} is reserved and cannot be used as a module name`);
      }
      const worker = new Worker(`${serviceDir}/${module}/start.js`, {
        execArgv: ['--require', './.pnp.cjs'],
      });
      this.workers[module] = worker;

      worker.on('message', this.messageRouter(module));
      worker.on('error', error => {
        ModularApplication.logger.error(`Error in ${module}`, { error });
      });
      worker.on('exit', code => {
        ModularApplication.logger.log(code === 0 ? 'info' : 'error', `Worker "${module}" exited with code ${code}`);
      });
    }
  }

  private messageRouter(source: string) {
    return (data: any) => {
      if (!Array.isArray(data)) {
        ModularApplication.logger.warn(INVALID_MESSAGE, { source, data, reason: NOT_ARRAY });
        return;
      }
      if (data.length !== 2) {
        ModularApplication.logger.warn(INVALID_MESSAGE, { source, data, reason: INVALID_ARRAY_LENGTH });
        return;
      }
      const [dest, body] = data;
      if (typeof dest !== 'string') {
        ModularApplication.logger.warn(INVALID_MESSAGE, { source, dest, body, reason: DESTINATION_NOT_A_STRING });
      }
      if (dest === '@error') {
        ModularApplication.logger.error(`Error received from worker "${source}"`, { source, dest, body });
        return;
      } else if (dest ! in this.workers) {
        ModularApplication.logger.warn(INVALID_MESSAGE, { source, dest, body, reason: DESTINATION_DOES_NOT_EXIST });
        return;
      }
      this.workers[dest].postMessage(body);
      ModularApplication.logger.debug(MESSAGE_SENT, { source, dest, body });
    };
  }
}

const MESSAGE_SENT = 'Routed a message from source to destination.';
const INVALID_MESSAGE = 'Received an invalid message, discarding.';
const NOT_ARRAY = 'Received message is not an array.';
const INVALID_ARRAY_LENGTH = 'Received message is an array, but does not have a length of 2.';
const DESTINATION_NOT_A_STRING = 'Received message\'s destination is not a string.';
const DESTINATION_DOES_NOT_EXIST = 'Received message\'s destination does not exist.';
