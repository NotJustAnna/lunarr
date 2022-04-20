import { performance } from 'perf_hooks';
import { Worker } from 'worker_threads';
import { createLogger } from './common/logger';
import * as console from 'console';

export function startApp(...modules: string[]) {
  const logger = createLogger('main');
  logger.info('Starting application...', { modules });
  let start = performance.now();
  new ModularApplication(modules);
  let end = performance.now();
  logger.info('Application started!', { time: end - start });
}

class ModularApplication {
  private static readonly logger = createLogger('ModularApplication');
  private readonly workers: Record<string, Worker> = {};

  constructor(modules: string[]) {
    for (const module of modules) {
      const worker = new Worker(`${__dirname}/app/${module}/index.js`, {
        execArgv: ['--require', './.pnp.cjs'],
      });
      this.workers[module] = worker;

      worker.on('message', this.messageRouter(module));
      worker.on('error', err => {
        console.error(err);
      });
      worker.on('exit', exitCode => {
        console.info(`Worker ${module} exited with code ${exitCode}`);
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
      if (dest ! in this.workers) {
        ModularApplication.logger.warn(INVALID_MESSAGE, { source, dest, body, reason: DESTINATION_DOES_NOT_EXIST });
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
