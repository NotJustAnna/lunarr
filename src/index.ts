import 'source-map-support/register';
import 'reflect-metadata';
import { initApp } from '@/app';
import { createLogger } from '@/app/logger';

initApp().catch((error) => {
  createLogger('Application').error('Error during application start-up', { error });
});
