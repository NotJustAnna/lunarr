import { workerPort } from '../../common/workers';
import { CoreApp } from './app';
import { createLogger } from '../../common/logger';

createLogger('worker/core').info('Starting application "core"...');
const port = workerPort();
const app = new CoreApp();

port.on('message', app.receiveMessage.bind(app));
