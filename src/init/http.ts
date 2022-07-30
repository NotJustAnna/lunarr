import { cwd } from 'process';
import express from 'express';
import { createLogger } from '@/app/logger';
import { Service } from 'typedi';
import * as batchControllers from '@/controllers/all';
import { AsyncInit } from '@/app/init/interfaces';
import { ControllerMetadata } from '@/app/controllers/metadata';
import 'express-async-errors';
import { HttpConfig } from '@/app/config/http';
import * as fs from 'fs-extra';
import { batchInitialize } from '@/utils/initializer';
import { ExitCode } from '@/utils/exitCode';

@Service()
export class HttpInitializer implements AsyncInit {
  private static readonly logger = createLogger('HttpInitializer');

  constructor(private readonly config: HttpConfig) {
  }

  private static async warnIfFrontendNotBuilt() {
    const buildDir = await fs.stat('frontend/build').catch(() => undefined);
    if (buildDir?.isDirectory()) {
      return;
    }
    HttpInitializer.logger.warn('<chalk bold-red>Frontend not built!</chalk> Run <chalk blueBright>yarn frontend build</chalk> to build the frontend.');
  }

  public async init() {
    await HttpInitializer.warnIfFrontendNotBuilt();

    const app = express().use(
      express.json(),
      express.urlencoded({ extended: true }),
      express.text({ type: ['application/xml', 'text/plain', 'text/html'] }),
      express.static('frontend/build'),
    );

    const controllers = await batchInitialize(batchControllers);
    if (controllers.errors.length > 0) {
      const errors = controllers.errors, count = errors.length;
      HttpInitializer.logger.error(`Controller phase failed with ${count} error${count === 1 ? '' : 's'}.`, { errors });
      process.exit(ExitCode.FATAL_UNRECOVERABLE_ERROR);
    }
    for (const controller of controllers.instances) {
      const metadata = ControllerMetadata.get(controller.constructor);
      if (metadata) {
        metadata.setup(app, controller);
      }
    }

    app.all('/api/*', (req, res) => {
      res.status(404).contentType('text/plain').send('Not found');
    });
    app.get('/*', (req, res) => {
      res.sendFile(`${cwd()}/frontend/build/index.html`);
    });
    app.listen(this.config.port);
    HttpInitializer.logger.info(`HTTP Application started! Listening on port ${this.config.port}`);
  }
}
