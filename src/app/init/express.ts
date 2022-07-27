import * as process from 'process';
import express from 'express';
import { Express } from 'express-serve-static-core';
import { createLogger } from '@/app/logger';
import { Constructable, Container, Service } from 'typedi';
import * as registeredControllers from '@/controllers/all';
import { AsyncInit, hasInit } from '@/app/init/interfaces';
import { getControllerMetadata } from '@/app/controllers/metadata';
import 'express-async-errors';

@Service()
export class ExpressInitializer implements AsyncInit {
  private static readonly logger = createLogger('ExpressInitializer');

  constructor() {
    if (!process.env.HTTP_PORT) {
      ExpressInitializer.logger.error('HTTP_PORT environment variable is not set');
      throw new Error('Assertion Error');
    }
  }

  public async init() {
    const app: Express = express();

    const port = Number(process.env.HTTP_PORT);

    app.use(express.static('public'));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(express.text({
      type: ['application/xml', 'text/plain', 'text/html'],
    }));
    await Promise.all(Object.values(registeredControllers).map(async (c: Constructable<any>) => {
      try {
        const instance = Container.get(c);
        if (hasInit(instance)) {
          await instance.init();
        }
        const metadata = getControllerMetadata(instance.constructor);
        if (metadata) {
          metadata.setup(app, instance);
        }
      } catch (error) {
        ExpressInitializer.logger.error(`Error while initializing ${c.name}`, { error });
      }
    }));
    app.all('/api/*', (req, res) => {
      res.status(404).contentType('text/plain').send('Not found');
    });
    app.get('/*', (req, res) => {
      res.sendFile(`${process.cwd()}/public/index.html`);
    });
    app.listen(port);
    ExpressInitializer.logger.info(`HTTP Application started! Listening on port ${port}`);
  }
}
