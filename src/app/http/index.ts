import { workerPort } from '../../common/workers';
import { HttpApp } from './app';
import { createLogger } from '../../common/logger';

createLogger('worker/http').info('Starting application "http"...');
const port = workerPort();
const app = new HttpApp();

port.on('message', app.receiveMessage.bind(app));
