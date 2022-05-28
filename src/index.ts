import 'source-map-support/register';
import { startApp } from './utils/init/mainThread';

// startApp('core');

startApp('discord', 'http', 'core');
