import 'source-map-support/register';
import 'reflect-metadata';
import { initApp } from '@/common/init';
import { createLogger } from '@/common/logger';

initApp().catch((error) => {
  createLogger('Application').error('Error during application start-up', { error });
});
