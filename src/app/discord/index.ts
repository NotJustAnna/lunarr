
import { workerPort } from '../../common/workers';
import { DiscordApp } from './app';
import { createLogger } from '../../common/logger';

createLogger('worker/discord').info('Starting application "discord"...');
const port = workerPort();
const app = new DiscordApp();

port.on('message', app.receiveMessage.bind(app));
